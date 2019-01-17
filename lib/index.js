const TYPE_DOCUMENT = 'doc';
const TYPE_COLLECTION = 'collection';
const cuid = require('cuid');
const toInt = (x, def) => isNaN(x) ? 0 : parseInt(x);

const USE_SNAPSHOT = false;

class DocumentSnapshot {
  constructor(id, data) {
    this._data = data;
    this.id = id;
  }

  data() {
    return this._data;
  }

}

class QuerySnapshot {
  constructor(id, data) {
    this._data = data;
    this.id = id;
  }

  data() {
    return this._data;
  }

  forEach(cb) {
    this._data.forEach(data => {
      cb && cb(new DocumentSnapshot(data && data._id, data))
    })
  }
}

class Logger {
  _log() {
    let args = Array.prototype.slice.call(arguments);
    console.log.apply(this, args);
    //throw new Error(args.join(" "));
  }

  info() {
    this._log.apply(this, arguments);
  }

  warn() {
    this._log.apply(this, arguments);
  }

  error() {
    this._log.apply(this, arguments);
    let args = Array.prototype.slice.call(arguments);
    //throw new Error(args.join(" "));
  }

  log() {
    this._log.apply(this, arguments);
  }
}

const customLogger = new Logger();

class StoreModel {
  constructor(parent, options) {
    let { type, name } = options || {};
    let dbStore;
    try {
      this.where_clauses = [];
      this.logger = customLogger;
      const isParent = parent instanceof StoreModel;
      if (!options && !isParent) {
        //the parent is the root collection
        type = TYPE_DOCUMENT;
        name = 'db:';
        if(parent && !parent.set || parent && !parent.get){
          //throw(new Error('bad store delegate interface'));
          //return;
        }
        parent = { pathName: '', dbStore: parent }
      } else {
        if (!name) {
          name = cuid();
        }
        //this.docName = docName;
      }
      this.id = name;
      this._id = name;
      this.docType = type;
      this.parent = parent;
      this.dbStore = parent.dbStore;
      this.pathName = `${parent.pathName}/${name}`;

    } catch (e) {
      this.logger.error('store-model constructor : ' + e.message);
      this.logger.error(e.stack);
      throw new Error("CANNOT ADD collection on collection.");
    }
  }

  setLogger(logger) {
    this._logger = logger;
  }

  throw_error(msg, reject) {
    //this.logger.error(`### ${msg} ##`, '==> proxy ', this.pathName, 'type', this.docType)
    try {
      // if something unexpected
      throw new Error(msg);
    } catch (e) {
      this.logger.error('Error : ' + e.message);
      this.logger.error(e.stack);
    }
    reject && reject(msg);
  }

  doc(name) {
    //this.logger.log(' doc','on proxy ', this.pathName,'type',this.docType,'ref',this.ref.constructor.name);
    if (this.id && this.docType === TYPE_COLLECTION) {
      if (!name) {
        this.logger.error('doc with no id!');
      }
      const pathName = name && name.split('/');
      name = pathName && pathName[0] || name;
      const obj = new StoreModel(this, { type: TYPE_DOCUMENT, name });
      if (pathName.length === 1) {
        return obj
      } else {
        return obj.collection(pathName.slice(1).join('/'));
      }
    }
    this.throw_error(`CANNOT ADD collection on type ${this.docType} ${this.pathName}`);
  }

  collection(name) {
    //this.logger.log(' collection','on proxy ', this.pathName,'type',this.docType);
    if (this.id && this.docType === TYPE_DOCUMENT) {
      const pathNames = name.split('/').filter(p => p);
      name = pathNames[0];
      const obj = new StoreModel(this, { type: TYPE_COLLECTION, name });
      if (pathNames.length === 1) {
        return obj
      } else {
        return obj.doc(pathNames.slice(1).join('/'));
      }

    }
    this.throw_error(`CANNOT ADD collection on type ${this.docType} ${this.pathName}`);

  }

  clone() {
    const c = new StoreModel();
    Object.keys(this).forEach(k => {
        if (c.hasOwnProperty(k)) {
          c[k] = this[k]
        }
      }
    );
    return c;
  }

  exists() {
    const me = this;
    return new Promise(function (resolve, reject) {
        //this.logger.log('calling get', me.pathName,me.id);
      }
    );
  }

  where(a, eq, b) {
    //TODO:check Indexes
    //if (this.id && this.docType === COLLECTION_TYPE) {
    const c = this.clone();
    c.where_clauses.push([a, eq, b]);
    return c;

    //this.throw_error(`CANNOT ADD collection on type ${this.docType} ${this.pathName}`, reject);
  }

  limit(l) {
    const c = this.clone();
    c.limit = l;
    return c;
  }

  orderBy(a, eq) {
    const c = this.clone()
    c.orderBy = [a, eq];
    return c;
  }

  delete() {
    return this.remove();
  }

  remove() {
    const me = this;
    return new Promise(function (resolve, reject) {

    })
  }

  async get() {
    try {
      const me = this;

      const path = me.pathName.replace('db:/', '');
      let data = await this.dbStore.get(path) // method, data
      if (USE_SNAPSHOT) {
        if (data instanceof Array) {
          data = new QuerySnapshot(me.id, data);
        }
      }
        return data;

    } catch (err) {
      this.logger.error('Error : ' + err.message);
      this.logger.error(err.stack || "");
    }
      return null;
  }

  subscribe(options, resolve) {
    return this.dbStore.subscribe(options, resolve);

  }

  async set(data, opt = { merge: true }) {
    const me = this;
    const path = me.pathName.replace('db:/', '');
    return await this.dbStore.set(path, data); // method, data

  }

}

module.exports = StoreModel;


