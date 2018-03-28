import bookmarks from './bookmarks.js';
import index from './index.js';
import omnibox from './omnibox.js';
import storage from './storageDao.js';
import settings from './settings.js';
import history from './history.js';

//1. setup stuf on install

browser.runtime.onInstalled.addListener(loadBrowsingData);

settings.init();

//2. init omnibox
omnibox.init();

//3. init bookmark handlers
bookmarks.init();
//init session time
history.setSession(new Date());
history.init();

//4. clear storage
storage.init();

function loadBrowsingData(){
    bookmarks.getAll().then(
	function(bms){
	    //1 : index bms
	    index.index(bms);
	}
    );
    history.getAll().then(
	function(pageMap){
	    index.index(pageMap);
	}
    );
    
}
