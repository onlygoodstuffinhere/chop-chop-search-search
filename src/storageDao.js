/*
  Store and retrieve stuff in extension localstorage
*/

export default{
    set: store,
    get: retrieve,
    del: remove,
    init: setup, //TODO: delete if no need for this
    has: contains,
    getAll: findAll
};

async function store( type, key, val){
    let k = String.raw`${type}.${key}`;
    let data = {};
    data[k] = val;
    await browser.storage.local.set(data);
}
async function retrieve ( type, key){
    let k = `${type}.${key}`;
    let res = await browser.storage.local.get(k);
    return res[k];
}
function remove ( type, key){
    browser.storage.local.remove(`${type}.${key}`);
}
function setup(){
    browser.storage.local.clear();//returns promise
}
async function contains(type, key){
    let res = await browser.storage.local.get(`${type}.${key}`);
    return !( Object.keys(res).length === 0 && res.constructor === Object);
}
async function findAll(type){
    let allStoredObjects = await browser.storage.local.get();
    let resultArray = [];
    for ( let key in allStoredObjects ){
	if ( allStoredObjects.hasOwnProperty(key)){
	    if ( key.startsWith(type)){
		let obj = {};
		obj.id = key;
		obj.val = allStoredObjects[key];
		resultArray.push( obj );
	    }
	}
    }
    return resultArray;
}
