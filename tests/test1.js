const StoreModel = require('../');

class Store extends StoreModel{
  set(){

  }
}
async function test() {
  const stores = { '/': 'root' }
  const store = new StoreModel({
    get: async (path) => stores[path],
    set: async (path,value) => stores[path]=value,
  });

  const coll = store.collection('mycollect/doc1/coll2');
  await coll.set({ titi: 'tiiii' });
  const obj = await coll.get();
  console.log('getted obj', obj);
}

test().then().catch(e=> console.error(e));
