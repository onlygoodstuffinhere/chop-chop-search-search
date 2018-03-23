import stringUtils from './stringUtils.js';

var index = new Map();
var bmMap = new Map();

export default{
    index : function ( bookmarks ){
	//bmMap = bookmarks;
	bookmarks.forEach(function (v,k ){
	    if ( ! bmMap.has(k)){
		bmMap.set(k,v);
		let prefixedIndexes = [];
		prefixedIndexes = stringUtils.toIndexable(v.title);
		prefixedIndexes = prefixedIndexes.concat(stringUtils.urlToIndexable(v.url));
		prefixedIndexes = Array.from(new Set(prefixedIndexes));
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
	    }
	});
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
    },
    disindex : function ( BMId ) {
	if ( bmMap.has(BMId)){
	    //1. remove from bookmark map
	    bmMap.delete(BMId);

	    //2. remove from index
	    index.forEach(function(v,k){
		let i = v.indexOf(BMId);
		if ( i !== -1  ){
		    v = v.splice(i, 1);
		    if ( v.length > 0 ){
			index.set(k,v);
		    }
		    else{
			index.delete(k);
		    }
		}
	    });
	}
    }
}
