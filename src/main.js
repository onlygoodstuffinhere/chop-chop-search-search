import bookmarks from './bookmarks.js';
import index from './index.js';
import omnibox from './omnibox.js';
import storage from './storageDao.js';
import settings from './settings.js';

//1. setup stuf on install

browser.runtime.onInstalled.addListener(loadBms);

settings.init();


//2. init omnibox
omnibox.init();

//3. init bookmark handlers
bookmarks.init();

//4. clear storage
storage.init();

function loadBms(){
    bookmarks.getAll().then(
	function(bms){
	    //1 : index bms
	    index.index(bms);//.then(res=>storage.getAll("test","test"));


	}
    );    
}


