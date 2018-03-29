/*
  Handles settings, saves them in localstorage, displays them on settings page.
  Settings object : 

  {
    "indexBm" : <true/false>,
    "indexHistory": <true/false>,
    "historyDuration": <"forever"/"7d"/"24h"/"session">
  }
*/
import storage from './storageDao.js';
import index from './index.js';
import bookmarks from './bookmarks.js';
import history from './history.js';
import tabs from './tabs.js';

export default{

    init: function(){
	browser.runtime.onMessage.addListener(handleMsg);
    },
    get: getSettings
};

function handleMsg ( message, sender, sendResponse ){
    let cmd = message.cmd;
    switch ( cmd ){
    case "set-settings": {
	setSettings(message.settings);
	sendResponse({});
	break;
    }
    case "get-settings":{
	getSettings().then(function(settings){
	    sendResponse(settings);
	});
	break;
    }
    }
    return true;
}

async function getSettings(){
    let settings = await storage.get("settings", "settings");
    if ( settings == undefined ){
	let defaultSettings = {
	    "indexBm" : true,
	    "indexHistory": true,
	    "indexTabs": true,
	    "historyDuration": "forever"
	};
	return defaultSettings;
    }
    else{
	return settings;
    }
}

function setSettings(settings){
    // trigger reindexing and purging of pages
    getSettings().then(function (oldSettings) {
	// persist new settings first because indexing logic
	// looks at settings again to know wether to persist stuff
	// or not :/
	storage.set("settings", "settings", settings).then(function(){
	    //compare old settings to new settings
	    if ( oldSettings.indexBm !== settings.indexBm ){
		if ( settings.indexBm ){
		    //index bookmarks
		    bookmarks.getAll().then(function (bms){
			index.index(bms);
		    });
		}
		else{
		    //disindex bookmarks
		    index.disindexByType("bookmark");
		}
	    }
	    if ( oldSettings.indexTabs !== settings.indexTabs ){
		if ( settings.indexTabs ){
		    //TODO
		    tabs.getAll().then(function(tbs){
			index.index(tbs);
		    });
		}
		else{
		    index.disindexByType("tab");
		}
	    } 
	    if ( oldSettings.indexHistory !== settings.indexHistory ){
		if ( settings.indexHistory ){
		    //index history
		    history.getAll().then(function(hist){
			index.index(hist);
		    });
		}
		else{
		    //disindex history
		    index.disindexByType("history");
		}
	    }
	    else if (settings.indexHistory &&
		     ( oldSettings.historyDuration !== settings.historyDuration ) ){
		// disindex relevant parts of browsing history
		history.getAll().then(function(hist){
		    // index history, in case new settings allow for more pages
		    // ( will look at settings and not index wrong stuff so it's cool)
		    index.index(hist);
		    // remove history items that's out of range
		    index.getAllByType("history").then(function(hist){
			//get history item ids to remove
			let idsToDel = history.filterByDate(hist, settings.historyDuration );
			index.disindex(idsToDel);
		    });
		});
		
	    }
	});
	 
    });
}
