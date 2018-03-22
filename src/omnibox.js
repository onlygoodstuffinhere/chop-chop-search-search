import search from './search.js';

export default {
    init : function (){
	browser.omnibox.onInputChanged.addListener(srcInputListener);
	browser.omnibox.onInputEntered.addListener(inputEntered);
	browser.omnibox.setDefaultSuggestion(
	    { "description": "CHOP CHOP'S SEARCH SEARCH - type at least 3 characters" }
	);
    }

}

function inputEntered(url, disposition){
    switch (disposition) {
    case "currentTab":
	browser.tabs.update({url});
	break;
    case "newForegroundTab":
	browser.tabs.create({url});
	break;
    case "newBackgroundTab":
	browser.tabs.create({url, active: false});
	break;
    }
}
function emptySuggestion(){
    return {
	"content": "",
	"description": "Sry, no results. Please type at lest 3 characters."
    }
}
function srcInputListener(text, suggest){
    console.log ( "searching for query : "+text);
    if ( text.length < 3 ) {
	suggest(emptySuggestion());
	return ;
    }
    let results = search.queryToBookmarks(text);
    let suggestions = results.map(function (bm) {
	return {
	    "content": bm.url,
	    "description": bm.title
	};
    });
    if( suggestions.length === 0 ){
	suggest(emptySuggestion());
	return;
    }
    suggest(suggestions);
    
}
