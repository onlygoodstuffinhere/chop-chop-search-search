/* ---------------------------------------------------------------------
  Fetch bookmarks on install, get new bookmarks, get deleted bookmarks
-----------------------------------------------------------------------*/
import md5 from 'blueimp-md5';

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
    }

}


/*export default async function getAll(){
    try{
	const bmRootArray = await browser.bookmarks.getTree();
	let bmRoot = bmRootArray[0];
	let result = walkBmTree(bmRoot);
	return result;
    }
    catch(err){
	console.log(`fugg ${err}`);
    }
}*/


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
    else if ( bmNode.type === "bookmark" ){
	let bm = {};
	bm.title = bmNode.title;
	bm.url = bmNode.url;
	bm.date = bmNode.dateAdded;
	bm.id = md5 ( bm.url + bm.title );
	bmMap.set(bm.id,bm);
    }
    return bmMap;
}

//export { getAll };
