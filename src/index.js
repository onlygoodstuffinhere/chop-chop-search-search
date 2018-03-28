import stringUtils from './stringUtils.js';
import storage from './storageDao.js';

//var index = new Map();
//var bmMap = new Map();

export default{
    /*
      Index pages 
      
     */
    index : indexPages,
    
    /*
      Get array of page ids from an index token or array of tokens
     */
    getPageIds : getPagesIds,

    /*
      Get array of bookmarks from a bookmark id or array of ids
     */
    getPages : getPages,

    /*
      Disindex pages, either takes array of ids or a single id
     */
    disindex : remove,
    disindexByType : removeByType,
    getAllByType : findByType
};


/*
  Returns array of all pages by their type <bookmark/history>
*/
async function findByType( type ){
    let allPages = await storage.getAll("page");
    let result = [];
    for ( let page of allPages ){
	if ( page.val.type === type ){
	    result.push(page.val);
	}
    }
    return result;
}

/*
  Remove pages from the index based on their type
  (bookmark / history )
*/
async function removeByType( type ){
    let allPages = await storage.getAll("page");
    let idArray = [];
    for ( let page of allPages ){
	if (page.type === type ){
	    idArray.push(page.id);
	}
    }
    await remove(idArray);
}

/*
  Remove a page or pages from the index
  @param and id or array of ids
*/
async function remove( pageId ) {
    //remove page ids from pageid - page index
    if ( Array.isArray(pageId) ){
	for (let id of pageId ) {
	    let hasPage = await storage.has("page", id);
	    if ( hasPage === true ){
		storage.del("page", id);
	    }
	}
    }
    else{
	let hasPage = await storage.has("page", pageId);
	if ( hasPage === true ){
	    storage.del("page", pageId);
	}
    }
	
    // get full index ( token - array[pageId] )
    // remove references to pageId
    let indexArray = await storage.getAll("index");
    for ( let indexItem of indexArray ) {
	if( Array.isArray(pageId)){
	    for ( let id of pageId ){
		let i = indexItem.val.indexOf(id);
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
	else{
	    let i = indexItem.val.indexOf(pageId);
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

/*
  Index pages to make them available to search
  @param : pages
           Map [ id, page], page being an object : 
	   /*
      Returns map of all bookmarks
      bookmark is an object like this :
      {
	"type": <"bookmark"/"history">,
	"title": <string>,
	"url": <string>,
	"date": <int>,
	"id": <string>	
	}
*/
async function indexPages( pages ){
    pages.forEach(async function (v,k ){
	let hasPage = await storage.has("page", k);
	
	if ( hasPage === false ){
	    // store page in pageId - page index
	    await storage.set("page", k, v);
	    // generate search index tokens
	    let prefixedIndexes = [];
	    prefixedIndexes = stringUtils.toIndexable(v.title);
	    prefixedIndexes = prefixedIndexes.concat(stringUtils.urlToIndexable(v.url));
	    prefixedIndexes = Array.from(new Set(prefixedIndexes)); //remove dupes
	    // update search index (search token - array [page id])
	    for ( let t of prefixedIndexes ) {
		let hasToken = await storage.has("index",t);
		if ( hasToken === true ){
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
		     
/*
  Get page ids from search token
  by hitting  <search token - array[page id]> index
  @param key : string or array of strings
  @returns : array of page ids
*/
async function getPagesIds ( key ){
    let result = [];
    // array of tokens
    if ( key.constructor === Array ){
	for ( const k of key ){
	    let ids = await tokenToPageIds(k);
	    result = result.concat(ids);
	}
    }
    // single token
    else{
	let ids = await tokenToPageIds (key);
	result = result.concat(ids);
    }
    return result;
}

async function tokenToPageIds ( token ){
    let result = [];
    let hasToken = await storage.has("index", token);
    if ( hasToken === true ){
	let ids = await storage.get("index", token);
	result = result.concat(ids);
    }
    return result;
}

/*
  Get page from page id
  @param : pageId string or array of string
  @return : array of pages
*/
async function getPages ( pageId ) {
    let result = [];
    // array of ids
    if( pageId.constructor === Array ){
	for ( const id of pageId ) {
	    let pages = await getPagesFromId( id );
	    result = result.concat(pages);
	}
    }
    // single id
    else{
	let pages = await getPagesFromId( pageId );
	result = result.concat(pages);
    }
    return result;
}

async function getPagesFromId(pageId){
    let result = [];
    let hasPage = await storage.has("page", pageId);
    if ( hasPage === true ){
	let page = await storage.get("page", pageId);
	result.push(page);
    }
    return result;
}
