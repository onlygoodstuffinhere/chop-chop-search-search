/*
  Handles opened tabs
*/
import settingsService from './settings.js';
import index from './index.js';

export default{
    getAll: loadTabs,
    init: function(){
	//setup event listeners
	browser.tabs.onCreated.addListener(handleTabCreated);
	browser.tabs.onUpdated.addListener(handleTabUpdated);
	browser.tabs.onRemoved.addListener(handleTabCreated);
    }
};


function handleTabCreated( tab ){
    let toIndex = new Map();
    settingsService.get().then(function(settings){
	if ( settings.indexTabs === false ){
	    return;
	}
	let parsedTab = parseTab(tab);
	if (! filterTabs (parsedTab)){
	    return;
	}
	toIndex.set("tab_"+parsedTab.id, parsedTab);
	console.log("index tab");
	console.log(toIndex);
	index.index(toIndex);
    });
}

function handleTabUpdated(tabId, updatedInfo, tab){
    let toIndex = new Map();
    settingsService.get().then(function(settings){
	if ( settings.indexTabs === false ){
	    return;
	}
	let parsedTab = parseTab(tab);
	if (! filterTabs (parsedTab)){
	    return;
	}
	toIndex.set("tab_"+parsedTab.id, parsedTab);
	console.log("update tab");
	console.log(toIndex);
	index.index(toIndex);
    });
}

function handleTabRemoved( tabId, removeInfo ){
    console.log("remove tab "+tabId);
    index.disindex( "tab_"+tabId );
}

async function loadTabs(){
    // look at settings
    let toIndex = new Map();
    let settings = await settingsService.get();
    if ( settings.indexTabs === false ){
	return toIndex;
    }
    //get all tabs
    let tabArray = await browser.tabs.query({});
    //perse relevant stuff, remove unusable tabs
    tabArray = tabArray.map( parseTab ).filter(filterTabs);
    console.log("tabs !");
    console.log(tabArray);
    
    for (let tab of tabArray ){
	toIndex.set("tab_"+tab.id, tab);
    }
    return toIndex;
}


/*
  Returns true if tab has valid title, url and id
*/
function filterTabs(tabObject){
    return (tabObject.title !== undefined && tabObject.title !== "" &&
	    tabObject.url !== undefined && tabObject.url !== "" && tabObject.url.startsWith("http") &&
	   tabObject.id !== undefined && tabObject.id !== "");
}

function parseTab( rawTab ){
    return{
	"title": rawTab.title,
	"url": rawTab.url,
	"id": rawTab.id,
	"type": "tab",
	"date": rawTab.lastAccessed
    };
}
