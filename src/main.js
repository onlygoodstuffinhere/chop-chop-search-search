import bookmarks from './bookmarks.js';
import index from './index.js';
import omnibox from './omnibox.js';

//1. setup stuf on install

browser.runtime.onInstalled.addListener(loadBms);

//2. init omnibox
omnibox.init();

//3. init bookmark handlers
bookmarks.init();

function loadBms(){
    bookmarks.getAll().then(
	function(bms){
	    //1 : index bms
	    index.index(bms);
	    //console.log(bms);
	}
    );    
}


