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

export default{

    init: function(){
	console.log("background settings handler here");
	browser.runtime.onMessage.addListener(handleMsg);
    },
    get: getSettings
};

function handleMsg ( message, sender, sendResponse ){
    console.log("backround script, received message : ");
    console.log(message);
    let cmd = message.cmd;
    switch ( cmd ){
    case "set-settings": {
	console.log("Received settings from index page, saving them to local storage now");
	console.log(message.settings);
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
    console.log("settings from local storage : ");
    console.log(settings);
    if ( settings == undefined ){
	let defaultSettings = {
	    "indexBm" : true,
	    "indexHistory": true,
	    "historyDuration": "forever"
	};
	console.log("no settings in local storage, returning defaults");
	return defaultSettings;
    }
    else{
	console.log("settings from local storage : ");
	console.log(settings);
	return settings;
    }
}

function setSettings(settings){
    storage.set("settings", "settings", settings);
}
