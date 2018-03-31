import stringUtils from './stringUtils.js';
import index from './index.js';

var levenshteinTreshold = 0.65;

//TODO : fix this, have it make sense
var scoreMults = {
    "history": 1.2,
    "bookmark": 1.5,
    "tab": 2
};


export default {
    queryToPages: async function( query, type ){
	let srcIndices = stringUtils.toSearchable(query);
	let pageIds = await index.getPageIds(srcIndices);
	let pages = await index.getPages(pageIds);
	pages = Array.from(new Set(pages)); //remove dupes
	pages = filterPagesByType(pages, type);
	pages = sortPages(pages, query);
	return pages;
    }
};

function filterPagesByType( pages , type ){
    switch ( type ){
    case "all":{
	return pages;
	break;
    }
    case "history":{
	return pages.filter(page=> page.type === "history");
	break;
    }
    case "bookmark":{
	return pages.filter(page=> page.type === "bookmark");
	break;
    }
    case "tab":{
	return pages.filter(page=> page.type === "tab");
	break;
    }
    }
    return pages;
}

function sortPages(pageResults, query){
    let compQuery = stringUtils.toComparable(query);
    //let scoredPages = [];
    // url - array of scored pages
    let urlScoredPageMap = new Map();

    pageResults.forEach(function (page){
	let compPage = stringUtils.toComparable(page.title);

	let urlTokens = stringUtils.urlToTokens(page.url);
	urlTokens.forEach(function (tk){
	    compPage = compPage.concat(stringUtils.toComparable(tk));
	});
	compPage = Array.from(new Set(compPage));
	
	let hitScore = 0;
	for ( let tk of compQuery){
	    for (let bt of compPage ){
		let gScore = stringUtils.levenshtein(tk,bt);
		if ( gScore >= levenshteinTreshold ) {
		    hitScore ++;
		}
	    }
	}
	if ( hitScore <= 0 ){
	    return;
	}
	hitScore = hitScore * scorePonderation(page);
	let sPageArray = [];
	if ( urlScoredPageMap.has(page.url)){
	    sPageArray = urlScoredPageMap.get(page.url);
	}
	sPageArray.push({
		"score": hitScore,
		"item": page
	    });
	urlScoredPageMap.set(page.url, sPageArray);
    });

    let scoredPages = aggregateScoredPages(urlScoredPageMap);
    
    //scoredPages = scoredPages.filter(r => r.score > 0);
    scoredPages.sort(compareScoredPages);
    let result = scoredPages.map(function ( sb ){
	return sb.item;
    });
    return result;
}

function scorePonderation ( page ){ //TODO: fix this and have scoring system that makes sense :)
    let p = scoreMults[page.type];
    if ( page.type === "history" ){
	p = Math.pow(p, page.visitCount);
    }
    return p;
} 

/*
  Aggregates page scores for pages figuring as result from different sources
  ( bookmarks, history and opened tabs )
  @param : url - array of scored pages
  @return : array of scored pages
*/
function aggregateScoredPages(urlScoredPageMap){
    let result = [];
    urlScoredPageMap.forEach(function(pageArray, url){
	//TODO: tune this
	let aggregatedScoredPage = {
	    "item": pageArray[0].item,
	    "score": 0
	};
	if ( pageArray.length > 1) {
	    aggregatedScoredPage.item.type = "aggregated";
	}
	for ( let sPage of pageArray ){
	    aggregatedScoredPage.score += sPage.score;
	}
	result.push(aggregatedScoredPage);
    });
    return result;
}


function compareScoredPages(scoredPageA, scoredPageB ){ // TODO : take type of page into account
                                                        // like bookmarks > history
    //sort by score, then by most recent
    if ( scoredPageA.score > scoredPageB.score ){
	return -1;
    }
    else if ( scoredPageA.score < scoredPageB.score ){
	return 1;
    }
    else if ( scoredPageA.score === scoredPageB.score ){
	if ( scoredPageA.date > scoredPageB.date ){
	    return -1;
	}
	else{
	    return 1;
	}
    }
    else{
	return 0;
    }	
}
