/*
  Get browsing history and index it
*/
import settingsService from "./settings.js";
import index from "./index.js";

var incompletePages = new Map();
var sessionStart;

export default{
    /*
      Returns map of browsing history pages according to parameters
      defined in the settings.

      Pages are objects like this :
      {
	"type": "history",
	"title": <string>,
	"url": <string>,
	"date": <int>,
	"id": <string>,
	"visitCount": <int>
	}
      @return : Map[id,page]
     */
    getAll: loadHistory,
    /*
      Register handlers for history updates
     */
    init: function (){
	browser.history.onVisited.addListener(handleVisited);
	browser.history.onVisitRemoved.addListener(handleRemoved);
	browser.history.onTitleChanged.addListener(handleTitleChanged);
    },
    filterByDate: filterHistoryByDaterange,
    getSession: getSessionDate,
    setSession: setSessionDate
};

function getSessionDate(){
    return sessionStart;
}

function setSessionDate( date ){
    sessionStart = date;
}

async function loadHistory(){
    // get settings to decide what pages to fetch
    let settings = await settingsService.get();
    if ( settings.indexHistory === true ) { //only get history if enabled in settings
	let dateRange = settings.historyDuration; //<"forever"/"7d"/"24h"/"session">
	let startDate;
	let endDate = new Date();
	//javascript date is timestamp in millis
	switch(dateRange){
	case "forever":{
	    startDate = new Date('August 19, 1975 23:15:30');;
	    break;
	}
	case "7d":{
	    startDate = new Date();
	    startDate = startDate - 604800000;
	    break;
	}
	case "24h":{
	    startDate = new Date();
	    startDate = startDate - 86400000;
	    break;
	}
	case "session":{
	    //TODO: record session start time
	    //console.log("TODO : keep track of session time");
	    startDate = sessionStart;//new Date('August 19, 1975 23:15:30');
	    break;
	}
	}
	
	let query = {
	    "text": "", //empty string gets all the bookmarks
	    "startTime": startDate,
	    "endTime": endDate,
	    "maxResults": Number.MAX_SAFE_INTEGER
	};
	
	let history = await browser.history.search(query);
	let pageMap = new Map();
	for (let p of history ){
	    if ( filterHistoryItem(p) ){
		let parsedPage = parseHistoryItem(p);
		pageMap.set(parsedPage.id, parsedPage);
	    }
	}
	return pageMap;
    }
    else{// settings says we don't use browsing history
	return new Map();
    }
}

function parseHistoryItem(historyItem){
    return {
	title: historyItem.title,
	url: historyItem.url,
	type: "history",
	id: "his_"+historyItem.id,
	visitCount: historyItem.visitCount,
	date: historyItem.lastVisitTime
    };
}

function filterHistoryItem(historyItem){
    return historyItem.url.startsWith("http");
}

function handleVisited(historyItem){
    if ( historyItem.title === "" ){ 
	/*
	  Title should be empty at first, if so store page here until we get 
	  its full information.
	*/
	incompletePages.set(historyItem.url, parseHistoryItem(historyItem));
    }
    else{
	indexHistory(parseHistoryItem(historyItem));
    }
}

/*
  Called when history gets deleted
  Param will eiher have allHistory to true and no urls or
  have allHistory to false and urls of deleted browsing history.
  @param{
  "urls": [<string>],
  "allHistory": boolean
  }
*/
function handleRemoved (deleted) {
    if ( deleted.allHistory ){
	//no urls, we just remove all browsing history
	index.disindexByType("history");
    }
    else{
	//remove urls in array
	index.getAllByType("history").then(function(allHist){
	    let idArray = [];
	    for( let historyItem of allHist ){
		if ( deleted.urls.includes(historyItem.url) ){
		    idArray.push(historyItem.id);
		}
	    }
	    index.disindex(idArray);
	});
    }
}

/*
  Gets called when freshly visited page loads its title
  @param {
  "title": <string>,
  "url": <string>
  }
*/
function handleTitleChanged(changedObj){
    if ( incompletePages.has(changedObj.url) ){
	let histObj = incompletePages.get(changedObj.url);
	histObj.title = changedObj.title;
	indexHistory(histObj);
    }
    return;
}

function indexHistory (historyItem ){
    if ( ! filterHistoryItem(historyItem) ){
	return;
    }
    
    settingsService.get().then(function(settings){
	if ( settings.indexHistory === true ){
	    let toIndex = new Map();
	    toIndex.set(historyItem.id, historyItem);
	    index.index(toIndex);
	}
    });
} 

/*
  Returns history item ids to remove based off date range
  date range one of : <"forever"/"7d"/"24h"/"session">
*/

function filterHistoryByDaterange(historyArray, dateRange){
    if ( dateRange === "forever"){
	return [];
    }
    let results = [];
    let now = new Date();
    for ( let hist of historyArray ){
	switch (dateRange) {
	case "7d":{
	    if( (now - hist.date ) > 604800000 ){
		results.push(hist.id);
	    }
	    break;
	}
	case "24h": {
	    if( (now - hist.date ) > 86400000 ){
		results.push(hist.id);
	    }
	    break;
	}
	case "session": {
	    if( (now - hist.date ) > ( now - sessionStart ) ){
		results.push(hist.id);
	    }
	    break;
	}
	}
    }
    return results;
}
