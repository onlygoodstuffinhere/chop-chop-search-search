/*
  String manipulation stuff
*/
import lvs from 'fast-levenshtein';
import doubleMetaphone from 'double-metaphone';

// radix tree min str length
var rTreeMinLength = 2;

export default {
    toLowerCase : lowerCase,
    tokenize : tokenizer,
    filterEmptyString : isNotEmpty,
    rTree : radixTree,
    levenshtein: gld,
    // tokenize, metaphone, remove dupes
    toSearchable : function ( query ){
	let tokenized = lcTokenizeFilter(query);
	let metaphoned = [];
	tokenized.forEach(function (token){
	    metaphoned = metaphoned.concat(doubleMetaphone(token));
	});
	let result = Array.from(new Set(metaphoned));
	return result;
    },
    toComparable : function (text){
	let tokenized = lcTokenizeFilter(text);
	let result = Array.from(new Set(tokenized));
	return result;
    },
    toIndexable : function (str){
	let tokenArray = lcTokenizeFilter(str);
	let metaphoned = [];
	tokenArray.forEach(function(token){
	    metaphoned = metaphoned.concat(doubleMetaphone(token));
	});
	metaphoned = Array.from(new Set(metaphoned));
	let prefixedIndexes = [];
	metaphoned.forEach(function(mtp){
	    prefixedIndexes = prefixedIndexes.concat(radixTree(mtp));
	});
	prefixedIndexes = Array.from(new Set(prefixedIndexes));
	return prefixedIndexes;
    }
}


function radixTree ( str ) {
    if ( str.length <= rTreeMinLength ){
        return [str];
    }
    else{
        let result = [];
        for ( let i = rTreeMinLength ; i <= str.length ; i++ ){
	    result.push(str.substr(0, i));
        }
	return result;
    }
}
function lowerCase( str ){
    return str.toLowerCase();
}
function tokenizer( str ){
    return str.split(/\W/);
}
function isNotEmpty( str ) {
    return str !== "";
}
/*
  Generalized levenshtein dist 
  Returns double in [0,1]
*/
function gld (stra, strb){
    let ld = lvs.get ( stra, strb );
    let result = 1 - ((2 * ld) / (stra.length + strb.length + ld ));
    return result;
}
//convenience function
function lcTokenizeFilter(str){
    return tokenizer(lowerCase(str)).filter(isNotEmpty);
}
