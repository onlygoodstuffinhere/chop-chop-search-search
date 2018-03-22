import stringUtils from './stringUtils.js';
import index from './index.js';


export default {
    queryToBookmarks: function( query ){
	let srcIndices = stringUtils.toSearchable(query);
	let bmIds = index.getBMId(srcIndices);
	let bookmarks = index.getBM(bmIds);
	bookmarks = Array.from(new Set(bookmarks));
	console.log("query : "+query);
	//TODO : filter sort score bookmarks
	bookmarks = sortBookmarks(bookmarks, query);
	return bookmarks;
    }
}



/*function queryToBookmarks(text){
    let srcIndices = stringUtils.toSearchable(text);
    let bmIds = [];
    srcIndices.forEach(function(prefix){
	if( index.has(prefix)){
	    bmIds= bmIds.concat(index.get(prefix));
	}
    });
    let results = [];
    for( let id of bmIds ){
	if ( bookmarks.has(id)){
	    results.push(bookmarks.get(id));
	}
    }
    results = Array.from(new Set (results));
    results = sortBookMarks(results, text);
    return results;
}
*/
function sortBookmarks(bookmarkResults, query){
    let compQuery = stringUtils.toComparable(query);
    let scoredBookmarks = [];
    bookmarkResults.forEach(function (bookmark){
	let compBm = stringUtils.toComparable(bookmark.title);
	let hitScore = 0;
	for ( let tk of compQuery){
	    for (let bt of compBm ){
		let gScore = stringUtils.levenshtein(tk,bt);
		if ( gScore >= 0.85 ) {
		    hitScore ++;
		}
	    }
	}
	scoredBookmarks.push(
	    {
		"score": hitScore,
		"item": bookmark
	    }
	);
    });
    scoredBookmarks = scoredBookmarks.filter(r => r.score > 0);
    scoredBookmarks.sort(compareScoredBookmarks);
    console.log("scored bookmarks");
    console.log(scoredBookmarks);
    let result = scoredBookmarks.map(function ( sb ){
	return sb.item;
    });
    return result;
}


function compareScoredBookmarks(scoredBmA, scoredBmB ){
    //sort by score, then by most recent
    if ( scoredBmA.score > scoredBmB.score ){
	return -1;
    }
    else if ( scoredBmA.score < scoredBmB.score ){
	return 1;
    }
    else if ( scoredBmA.score === scoredBmB.score ){
	if ( scoredBmA.date > scoredBmB.date ){
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
