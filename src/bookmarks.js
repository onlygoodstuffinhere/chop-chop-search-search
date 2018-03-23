/* ---------------------------------------------------------------------
  Fetch bookmarks on install, get new bookmarks, get deleted bookmarks
-----------------------------------------------------------------------*/
//import md5 from 'blueimp-md5';
import index from './index.js';


export default {
    getAll : async function getAll(){
	try{
	    const bmRootArray = await browser.bookmarks.getTree();
	    let bmRoot = bmRootArray[0];
	    let result = walkBmTree(bmRoot);
	    return result;
	}
	catch(err){
	    console.log(`fugg ${err}`);
	}
    },
    init : function(){
	browser.bookmarks.onCreated.addListener(indexBm);
	browser.bookmarks.onRemoved.addListener(disindexBm);
	//browser.bookmarks.onChanged.addListener(); //TODO 
    }

}


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

function indexBm(id, bookmark){
    let bm = bmNodeToBm(bookmark);
    let bmMap = new Map();
    bmMap.set(bm.id,bm);
    index.index(bmMap);
}

function disindexBm(id, info){
    let bmId = id;
    index.disindex(bmId);
}

function bmNodeToBm( bmNode ){
    return {
	"title": bmNode.title,
	"url": bmNode.url,
	"date": bmNode.dateAdded,
	"id": bmNode.id	
    }
}
