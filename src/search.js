import stringUtils from './stringUtils.js';
import index from './index.js';

var levenshteinTreshold = 0.65;

export default {
    queryToPages: async function( query ){
	let srcIndices = stringUtils.toSearchable(query);
	let pageIds = await index.getPageIds(srcIndices);
	let pages = await index.getPages(pageIds);
	pages = Array.from(new Set(pages));
	pages = sortPages(pages, query);
	return pages;
    }
};

function sortPages(pageResults, query){
    let compQuery = stringUtils.toComparable(query);
    let scoredPages = [];
    pageResults.forEach(function (page){
	let compPage = stringUtils.toComparable(page.title);
	compPage = compPage.concat(stringUtils.urlToIndexable(page.url));
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
	scoredPages.push(
	    {
		"score": hitScore,
		"item": page
	    }
	);
    });
    scoredPages = scoredPages.filter(r => r.score > 0);
    scoredPages.sort(compareScoredPages);
    let result = scoredPages.map(function ( sb ){
	return sb.item;
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
