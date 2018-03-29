import bookmarks from './bookmarks.js';
import index from './index.js';
import omnibox from './omnibox.js';
import storage from './storageDao.js';
import settings from './settings.js';
import history from './history.js';
import tabs from './tabs.js';


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

tabs.init();

//4. clear storage
storage.init();
//index.disindexByType("tab"); //enable this once we start to persist storage

function loadBrowsingData(){
    bookmarks.getAll().then(
	function(bms){
	    //1 : index bms
	    index.index(bms);
	}
    );
    //TODO only do this loading stuff if data is not in storage
    // validate freshness of bms
    history.getAll().then(
	function(pageMap){
	    index.index(pageMap);
	}
    );

    tabs.getAll().then(function(tabs){
	index.index(tabs);
    });
}

