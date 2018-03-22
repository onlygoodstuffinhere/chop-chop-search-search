import stringUtils from './stringUtils.js';

var index = new Map();
var bmMap = {};

export default{
    index : function ( bookmarks ){
	bmMap = bookmarks;
	bookmarks.forEach(function (v,k ){
	    let prefixedIndexes = [];
	    prefixedIndexes = stringUtils.toIndexable(v.title);
	    
	    for ( let t of prefixedIndexes ) {
		if ( index.has(t) ){
		    let keys = index.get(t);
		    keys.push(k);
		    index.set(t,keys);
		}
		else{
		    let keyArray = [""+k];
		    index.set(t, keyArray);
		}
	    }
	});
	console.log(bookmarks);
	console.log(index);
    },
    getBMId : function ( key ){
	let result = [];
	if ( key.constructor === Array ){
	    key.forEach(function(k){
		if ( index.has(k)){
		    result = result.concat(index.get(k));
		}
	    });
	}
	else{
	    if ( index.has(key)){
		result.push(index.get(key));
	    }
	}
	return result;
    },
    getBM : function ( BMId ) {
	let result = [];
	if( BMId.constructor === Array ){
	    BMId.forEach(function(id){
		if ( bmMap.has(id)){
		    result.push(bmMap.get(id));
		}
	    });
	}
	else{
	    if ( bmMap.has(BMId)){
		result.push(bmMap.get(BMId));
	    }
	}
	return result;
    }
}
