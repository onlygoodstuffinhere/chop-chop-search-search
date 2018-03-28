/* ---------------------------------------------------------------------
  Fetch bookmarks on install, get new bookmarks, get deleted bookmarks
-----------------------------------------------------------------------*/
//import md5 from 'blueimp-md5';
import index from './index.js';
import settingsService from './settings.js';

export default {
    /*
      Returns map of all bookmarks
      bookmark is an object like this :
      {
	"type": "bookmark",
	"title": <string>,
	"url": <string>,
	"date": <int>,
	"id": <string>	
	}
      @return : Map[id,bookmark]
    */
    getAll : async function getAll(){
	let settings = await settingsService.get();
	if (settings.indexBm ){
	    try{
		const bmRootArray = await browser.bookmarks.getTree();
		let bmRoot = bmRootArray[0];
		let result = walkBmTree(bmRoot);
		return result;
	    }
	    catch(err){
		console.log(`Failed to get bookmarks : ${err}`);
		return new Map();
	    }
	}
	else{
	    return new Map();
	}
    },
    /*
      Registers callbacks for bookmark creation, deletion (and modification, comming soon) events
     */
    init : function(){
	browser.bookmarks.onCreated.addListener(indexBm);
	browser.bookmarks.onRemoved.addListener(disindexBm);
	//browser.bookmarks.onChanged.addListener(); //TODO 
    }

};

/*
  Called recursively to go through bookmark tree,
  returns map[id, bookmark]
*/
function walkBmTree ( bmNode ) {
    let bmMap = new Map();
    if ( bmNode.type === "folder" ) {
	for( let bmChild of bmNode.children ){
            //bmList = bmList.concat(walkBmTree(bmChild));
	    for ( var [k,v] of walkBmTree(bmChild)){
		bmMap.set(k,v);
	    }
	}
    }
    else if ( bmNode.type === "bookmark" && bmNode.url.startsWith("http")){
	let bm = bmNodeToBm(bmNode);
	bmMap.set(bm.id,bm);
    }
    return bmMap;
}

/*function getBmId ( url, title ){
    return md5 ( url + title );
}*/

/*
  Handles bookmark creation events :
  Parses ff bookmark, calls index script to index bm
  if settings allow bookmark indexing
*/
function indexBm(id, bookmark){
    settingsService.get().then(function (settings){
	if ( settings.indexBm ) {
	    let bm = bmNodeToBm(bookmark);
	    let bmMap = new Map();
	    bmMap.set(bm.id,bm);
	    index.index(bmMap);
	}	
    });
}

/*
  Handles bookmark deletion event
  Calls index script to disindex bm
*/
function disindexBm(id, info){
    let bmId = "bm_"+id;
    index.disindex(bmId);
}

/*
  Parses browser bookmark object
*/
function bmNodeToBm( bmNode ){
    return {
	"type": "bookmark", //we need to diferentiate bookmarks and other indexed pages
	                    // like history
	"title": bmNode.title,
	"url": bmNode.url,
	"date": bmNode.dateAdded,
	"id": "bm_"+bmNode.id	
    };
}
