import stringUtils from './stringUtils.js';
import index from './index.js';

var levenshteinTreshold = 0.65;

export default {
    queryToBookmarks: async function( query ){
	let srcIndices = stringUtils.toSearchable(query);
	let bmIds = await index.getBMId(srcIndices);
	console.log("bm ids");
	console.log(bmIds);
	let bookmarks = await index.getBM(bmIds);
	bookmarks = Array.from(new Set(bookmarks));
	bookmarks = sortBookmarks(bookmarks, query);
	return bookmarks;
	/*let srcIndices = stringUtils.toSearchable(query);
	index.getBMId(srcIndices).then(bmIds=>{
	    console.log("bm ids");
	    console.log(bmIds);
	    let bookmarks = await index.getBM(bmIds);
	    bookmarks = Array.from(new Set(bookmarks));
	    bookmarks = sortBookmarks(bookmarks, query);
	    return bookmarks;
	});*//*
	let bookmarks = index.getBM(bmIds);
	bookmarks = Array.from(new Set(bookmarks));
	bookmarks = sortBookmarks(bookmarks, query);
	return bookmarks;*/
    }
}

function sortBookmarks(bookmarkResults, query){
    let compQuery = stringUtils.toComparable(query);
    let scoredBookmarks = [];
    bookmarkResults.forEach(function (bookmark){
	let compBm = stringUtils.toComparable(bookmark.title);
	let hitScore = 0;
	for ( let tk of compQuery){
	    for (let bt of compBm ){
		let gScore = stringUtils.levenshtein(tk,bt);
		if ( gScore >= levenshteinTreshold ) {
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
