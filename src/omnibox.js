import search from './search.js';
import settingsService from './settings.js';


var searchPrefixes = {};

export default {
    init : function (){
	browser.omnibox.onInputChanged.addListener(srcInputListener);
	browser.omnibox.onInputEntered.addListener(inputEntered);
	browser.omnibox.setDefaultSuggestion(
	    { "description": "CHOP CHOP'S SEARCH SEARCH - type at least 3 characters" }
	);
	settingsService.get().then(function(settings){
	    searchPrefixes = settings.prefixes;
	});
    },
    setPrefixes: function(prefixes){
	searchPrefixes = prefixes;
    }

};

function inputEntered(url, disposition){
    switch (disposition) {
    case "currentTab":
	openTab(url, true);
	break;
    case "newForegroundTab":
	openTab(url, true);
	break;
    case "newBackgroundTab":
	openTab(url, false);
	break;
    }
}

function openTab ( url, active ){
    browser.tabs.query({"url": url}).then(function(openedTabs){
	if ( openedTabs.length > 0 ){
	    let tabId = openedTabs[0].id;
	    browser.tabs.update(tabId, {
		"active": true
	    });
	}
	else{
	    browser.tabs.create({url, active: active});
	}
    });
}

function emptySuggestion(){
    return {
	"content": "",
	"description": "Sry, no results. Please type at lest 3 characters."
    };
}
function srcInputListener(text, suggest){
    let query = text;
    let type = "all";
    if ( text.startsWith(searchPrefixes.historyPrefix + " ")){
	query = text.slice(searchPrefixes.historyPrefix.length + 1 );
	type = "history";
    }
    else if ( text.startsWith(searchPrefixes.tabPrefix + " ") ){
	query = text.slice(searchPrefixes.tabPrefix.length + 1 );
	type = "tab";
    }
    else if(text.startsWith(searchPrefixes.bookmarkPrefix + " ")){
	query = text.slice(searchPrefixes.bookmarkPrefix.length + 1);
	type = "bookmark";
    }
    
    if ( query.length < 3 ) {
	suggest(emptySuggestion());
	return ;
    }
    search.queryToPages(query, type).then(function(results){
	let suggestions = results.map(function (page) {
	    return {
		"content": page.url,
		"description": page.title
	    };
	});
	if( suggestions.length === 0 ){
	    suggest(emptySuggestion());
	    return;
	}
	suggest(suggestions);
    });
}
