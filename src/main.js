import bookmarks from './bookmarks.js';
import index from './index.js';
import omnibox from './omnibox.js';
import storage from './storageDao.js';
import settings from './settings.js';
import history from './history.js';
import tabs from './tabs.js';


//1. setup stuf on install

browser.runtime.onInstalled.addListener(loadBrowsingData);
browser.runtime.onStartup.addListener(loadBrowsingData);
//browser.runtime.onSuspend.addListener(function(){storage.init();});


//index.disindexByType("tab"); //enable this once we start to persist storage

function loadBrowsingData(){
    storage.init();
    //1.init settings first
    settings.init();

    //2. init omnibox event handlers
    omnibox.init();

    //3. init bookmark handlers
    bookmarks.init();
    
    //init session time and history event handlers
    history.setSession(new Date());    
    history.init();

    //tabs setup handlers
    index.disindexByType("tab");
    tabs.init();

    //4. clear storage
    //storage.init();

    // load bookmarks
    bookmarks.getAll().then(
	function(bms){
	    //1 : index bms
	    index.index(bms);
	}
    );

    // load history items
    history.getAll().then(
	function(pageMap){
	    index.index(pageMap);
	}
    );

    // load opened tabs
    tabs.getAll().then(function(tabs){
	index.index(tabs);
    });
}

function onStart(){
    // settings event handlers
    settings.init();

    //omnibar event handlers
    omnibox.init();

    //bookmark event handlers
    bookmarks.init();

    //init session time and history event handlers
    history.setSession(new Date());    
    history.init();

    //tabs setup handlers
    index.disindexByType("tab");
    tabs.init();
}
