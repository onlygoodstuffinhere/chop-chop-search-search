/*
  Handles settings form, sends it to background script.
  Settings object : 

  {
    "indexBm" : <true/false>,
    "indexHistory": <true/false>,
    "historyDuration": <"forever"/"7d"/"24h"/"session">
  }
*/


document.addEventListener("DOMContentLoaded", function(event) {
    loadSettings();
    document.getElementById("submitButton").addEventListener("click", saveSettings);
    document.getElementById("indexHistory").addEventListener("change", toggleHistorySettings);
});


function loadSettings(){
    browser.runtime.sendMessage({"cmd": "get-settings"}).then(function(settings){
	displaySettings(settings);
    });
}

function saveSettings(event){
    event.preventDefault();
    let settings = parseSettings();
    browser.runtime.sendMessage({"cmd": "set-settings", "settings": settings});
}

function displaySettings(settings){
    var bmCheckbox = document.getElementById("indexBookmarks");
    bmCheckbox.checked = settings.indexBm;
    var historyCheckbox = document.getElementById("indexHistory");
    historyCheckbox.checked = settings.indexHistory;
    var tabsCheckBox = document.getElementById("indexTabs");
    tabsCheckBox.checked = settings.indexTabs;
    
    if ( settings.indexHistory ){
	switch ( settings.historyDuration ){
	case "forever":{
	    document.getElementById("historyDurationForever").checked = true;
	    break;
	}
	case "7d":{
	    document.getElementById("historyDuration7d").checked = true;
	    break;
	}
	case "24h":{
	    document.getElementById("historyDuration24h").checked = true;
	    break;
	}
	case "session":{
	    document.getElementById("historyDurationSession").checked = true;
	    break;
	}
	}
    }
    else{
	disableHistorySettings();
    }
}

function parseSettings () {
    let settings = {};

    var bmCheckbox = document.getElementById("indexBookmarks");
    settings.indexBm = bmCheckbox.checked;
    var historyCheckbox = document.getElementById("indexHistory");
    settings.indexHistory = historyCheckbox.checked;
    var tabsCheckBox = document.getElementById("indexTabs");
    settings.indexTabs = tabsCheckBox.checked;
    
    if ( settings.indexHistory ){
	if ( document.getElementById("historyDurationForever").checked === true ){
	    settings.historyDuration = "forever";
	}
	else if ( document.getElementById("historyDuration7d").checked === true ){
	    settings.historyDuration = "7d";
	}
	else if ( document.getElementById("historyDuration24h").checked === true ){
	    settings.historyDuration = "24h";
	}
	else if ( document.getElementById("historyDurationSession").checked === true ){
	    settings.historyDuration = "session";
	}

    }
    return settings;
}

function disableHistorySettings(){
    document.getElementById("historyDurationForever").checked = false;
    document.getElementById("historyDuration7d").checked = false;
    document.getElementById("historyDuration24h").checked = false;
    document.getElementById("historyDurationSession").checked = false;
	
    document.getElementById("historyDurationForever").disabled = true;
    document.getElementById("historyDuration7d").disabled = true;
    document.getElementById("historyDuration24h").disabled = true;
    document.getElementById("historyDurationSession").disabled = true;
}

function enableHistorySettings(){
    document.getElementById("historyDurationForever").checked = true;
    document.getElementById("historyDuration7d").checked = false;
    document.getElementById("historyDuration24h").checked = false;
    document.getElementById("historyDurationSession").checked = false;
	
    document.getElementById("historyDurationForever").disabled = false;
    document.getElementById("historyDuration7d").disabled = false;
    document.getElementById("historyDuration24h").disabled = false;
    document.getElementById("historyDurationSession").disabled = false;
}

function toggleHistorySettings (){
    if ( document.getElementById("indexHistory").checked ){
	enableHistorySettings();
    }
    else{
	disableHistorySettings();
    }
}
