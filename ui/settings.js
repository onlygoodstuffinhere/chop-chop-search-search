/*
  Handles settings form, sends it to background script.
  Settings object : 
  {
  "indexBm" : <boolean>,
  "indexHistory": <boolean>,
  "indexTabs": <boolean>
  "historyDuration": <"forever"/"7d"/"24h"/"session">,
  "prefixes": {
    "bookmarkPrefix": <string>,
    "tabPrefix": <string>,
    "historyPrefix": <string>
    }
  }
*/


document.addEventListener("DOMContentLoaded", function(event) {
    loadMessages();
    loadSettings();
    document.getElementById("submitButton").addEventListener("click", saveSettings);
    document.getElementById("indexHistory").addEventListener("change", toggleHistorySettings);
    document.getElementById("indexBookmarks").addEventListener("change", toggleBookmarksSettings);
    document.getElementById("indexTabs").addEventListener("change", toggleTabsSettings);
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
    var bmPrefixInput = document.getElementById("bookmarkPrefix");
    bmPrefixInput.value = settings.prefixes.bookmarkPrefix;
    var tabPrefixInput = document.getElementById("tabPrefix");
    tabPrefixInput.value = settings.prefixes.tabPrefix;
    var histPrefixInput = document.getElementById("historyPrefix");
    histPrefixInput.value = settings.prefixes.historyPrefix;
    
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
	histPrefixInput.disabled = false;
    }
    else{
	disableHistorySettings();
	histPrefixInput.disabled = true;
    }
    bmPrefixInput.disabled = ! settings.indexBm;
    tabPrefixInput.disabled = ! settings.indexTabs;
}

function parseSettings () {
    let settings = {};

    var bmCheckbox = document.getElementById("indexBookmarks");
    settings.indexBm = bmCheckbox.checked;
    var historyCheckbox = document.getElementById("indexHistory");
    settings.indexHistory = historyCheckbox.checked;
    var tabsCheckBox = document.getElementById("indexTabs");
    settings.indexTabs = tabsCheckBox.checked;

    settings.prefixes = {
	"bookmarkPrefix": ":bkm",
	"tabPrefix": ":tab",
	"historyPrefix": ":hist"
    }; 
    
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
	var histPrefixInput = document.getElementById("historyPrefix");
	settings.prefixes.historyPrefix = histPrefixInput.value;
    }
    if ( settings.indexBm ){
	var bmPrefixInput = document.getElementById("bookmarkPrefix");
	settings.prefixes.bookmarkPrefix =  bmPrefixInput.value;
    }
    if ( settings.indexTabs ){
	var tabPrefixInput = document.getElementById("tabPrefix");
	settings.prefixes.tabPrefix = tabPrefixInput.value;
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
    document.getElementById("historyPrefix").disabled = true;
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
    document.getElementById("historyPrefix").disabled = false;
}

function toggleHistorySettings (){
    if ( document.getElementById("indexHistory").checked ){
	enableHistorySettings();
    }
    else{
	disableHistorySettings();
    }
}

function toggleBookmarksSettings(){
    document.getElementById("bookmarkPrefix").disabled = ! document.getElementById("bookmarkPrefix").disabled;
}

function toggleTabsSettings(){
    document.getElementById("tabPrefix").disabled = ! document.getElementById("tabPrefix").disabled;
}


function loadMessages(){
    document.getElementById("mainTitle").innerHTML = browser.i18n.getMessage("settingsPageMainTitle");
    document.getElementById("abstract").innerHTML = browser.i18n.getMessage("settingsPageIntoduction");
    document.getElementById("dataTitle").innerHTML = browser.i18n.getMessage("settingsPageDataTitle");
    document.getElementById("dataSourceQuestion").innerHTML = browser.i18n.getMessage("settingsPageDataSourceQuestion");
    document.getElementById("indexBookmarksLabel").innerHTML = browser.i18n.getMessage("settingsPageDataSourceBookmarkLabel");
    document.getElementById("indexTabsLabel").innerHTML = browser.i18n.getMessage("settingsPageDataSourceTabsLabel");
    document.getElementById("indexHistoryLabel").innerHTML = browser.i18n.getMessage("settingsPageDataSourceHistoryLabel");
    document.getElementById("historyDurationQuestion").innerHTML = browser.i18n.getMessage("settingsPageBrowsingHistoryQuestion");
    document.getElementById("historyDurationSessionLabel").innerHTML = browser.i18n.getMessage("settingsPageBrowsingHistorySessionLabel");
    document.getElementById("historyDuration24hLabel").innerHTML = browser.i18n.getMessage("settingsPageBrowsingHistory24hLabel");
    document.getElementById("historyDuration7dLabel").innerHTML = browser.i18n.getMessage("settingsPageBrowsingHistory7dLabel");
    document.getElementById("historyDurationForeverLabel").innerHTML = browser.i18n.getMessage("settingsPageBrowsingHistoryForeverLabel");
    document.getElementById("prefixTitle").innerHTML = browser.i18n.getMessage("settingsPagePrefixTitle");
    document.getElementById("prefixQuestion").innerHTML = browser.i18n.getMessage("settingsPagePrefixQuestion");
    document.getElementById("prefixBookmarksLabel").innerHTML = browser.i18n.getMessage("settingsPagePrefixBookmarkLabel");
    document.getElementById("prefixTabsLabel").innerHTML = browser.i18n.getMessage("settingsPagePrefixTabLabel");
    document.getElementById("prefixHistoryLabel").innerHTML = browser.i18n.getMessage("settingsPagePrefixHistoryLabel");
    document.getElementById("submitButton").value = browser.i18n.getMessage("settingsPageSubmitButton");

}
