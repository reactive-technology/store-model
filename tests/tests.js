const StoreModel = require('../');

describe('StoreModel', function() {
  let store;
  let collection;

  describe('check instance creation', function() {

    it('check empty instance creation', function() {
      store = new StoreModel();
      expect(store).to.be.an.object();
    });

    it('check instance store with invalid delegate storage', function() {
      expect(new StoreModel({})).toThrow(new Error('bad store delegate interface'));
    });

    it('check instance store with incomplete delegate storage', function() {
      expect(new StoreModel({set:()=>true})).to.be.an.object();
    });

    it('check instance store with incomplete delegate storage', function() {
      expect(new StoreModel({set:()=>true})).to.be.an.object();
    });

  });

  describe('check instance', function() {
    beforeEach(() => {
      store = new StoreModel();
    });
    it('check instance creation', function() {
      expect(store).to.be.an.object();
    });

    it('check instance store interface', function() {
      expect(store.doc).to.be.a.function();
      expect(store.collection).to.be.a.function();
    });
  });

  describe('check collection object', function() {
    beforeEach(() => {
      store = new StoreModel();
      collection = store.collection('myCollection');
    });
    it('check if instance and interface', function() {
      expect(collection).to.be.an.object();
      expect(collection.doc).to.be.a.function();
      expect(collection.collection).to.be.a.function();
      expect(collection.get).to.be.a.function();
      expect(collection.set).to.be.a.function();
    });

    it('check set', function() {
      console.log(Object.keys(store));
      expect(store.set({foo:'myval'})).to.be.an.boolean();
    });
  });

});
