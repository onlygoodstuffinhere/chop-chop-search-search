import bookmarks from './bookmarks.js';
import index from './index.js';
import omnibox from './omnibox.js';

console.log("script is loaded");
console.log("import test : ");



//1. setup stuf on install

browser.runtime.onInstalled.addListener(loadBms);

//2. init omnibox
omnibox.init();

function loadBms(){
    bookmarks.getAll().then(
	function(bms){
	    //1 : index bms
	    index.index(bms);
	    //console.log(bms);
	}
    );    
}


