import stringUtils from './stringUtils.js';
import storage from './storageDao.js';

//var index = new Map();
//var bmMap = new Map();

export default{
    index : indexBms,
    /*
      Get array of bookmark ids from an index token of array of tokens
     */
    getBMId : getBookmarkIds,
    /*
      Get array of bookmarks from a bookmark id or array of ids
     */
    getBM : getBookmarks,
    disindex : async function ( BMId ) {

	let hasBm = await storage.has("bookmarks", BMId);
	if ( hasBm === true ){
	    storage.del("bookmarks", BMId);
	}
	let indexArray = await storage.getAll("index"); //TODO
	for ( let indexItem of indexArray ) {
	    let i = indexItem.val.indexOf(BMId);
	    if (  i !== -1 ){
		indexItem.val = indexItem.val.splice ( i, 1 );
		if ( indexItem.val.lenth > 0){
		    storage.set("index", indexItem.id, indexItem.val);
		}
		else{
		    storage.del("index", indexItem.id );
		}
	    }
	}
    }
}

async function indexBms( bookmarks ){
    bookmarks.forEach(async function (v,k ){
	let hasBm = await storage.has("bookmarks", k);
	
	if ( hasBm === false ){
	    await storage.set("bookmarks", k, v);
	    let prefixedIndexes = [];
	    prefixedIndexes = stringUtils.toIndexable(v.title);
	    prefixedIndexes = prefixedIndexes.concat(stringUtils.urlToIndexable(v.url));
	    prefixedIndexes = Array.from(new Set(prefixedIndexes)); //remove dupes
	    for ( let t of prefixedIndexes ) {
		let hasToken = await storage.has("index",t);
		if ( hasToken == true ){
		    let ids = await storage.get("index", t);
		    ids.push(k);
		    await storage.set("index", t, ids);
		}
		else{
		    let keyArray = [""+k];
		    await storage.set("index", t, keyArray);
		}
	    }
	}
    });
}
		     

async function getBookmarkIds ( key ){
    let result = [];
    if ( key.constructor === Array ){
	for ( const k of key ){
	    let hasToken = await storage.has("index", k);
	    if( hasToken === true ){
		let ids = await storage.get("index", k);
		result = result.concat(ids);
	    }
	}
    }
    else{
	let hasToken = await storage.has("index", k);
	if ( hasToken === true ){
	    let ids = await storage.get("index", k);
	    result = result.concat(ids);
	}
    }
    return result;
 }
async function getBookmarks ( BMId ) {
    let result = [];
    if( BMId.constructor === Array ){
	for ( const id of BMId ) {
	    let hasBm = await storage.has("bookmarks",id);
	    if( hasBm === true ){
		let bms = await storage.get("bookmarks", id);
		result.push(bms)
	    }
	}
    }
    else{
	let hasBm = await storage.has("bookmarks", BMId);
	if ( hasBm === true ){
	    let bm = await storage.get("bookmarks", BMId);
	    result.push(bm);
	}
    }
    return result;
}
