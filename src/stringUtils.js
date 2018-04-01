/*
  String manipulation stuff
*/
import lvs from 'fast-levenshtein';
import doubleMetaphone from 'double-metaphone';
import parseDomain from 'parse-domain';


// radix tree min str length
var rTreeMinLength = 2;
var kwMinLength = 3;

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
    },
    urlToIndexable : urlToIndexableTokens,
    urlToTokens: urlTokenizer
};


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
    return str.split(/[\W_]/);
}
function isNotEmpty( str ) {
    return str !== "";
}
function tokenIsBigEnough(str){
    return str !== undefined && str !== null &&  str.length >= kwMinLength;
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

function urlTokenizer(urlStr){
    let url = new URL(lowerCase(urlStr));
    let domain = url.hostname;
    let path = url.pathname;

    //remove subdomain and tlds, handles weirdo tlds
    let parsedDomain = parseDomain(domain); 
    domain = ( parsedDomain && parsedDomain.domain ) ? parsedDomain.domain : domain;

    //remove file extension
    let urlArray = path.split(".");
    if( urlArray.length === 1 || ( urlArray[0] === "" && urlArray.length === 2 ) ) {
	//no file extension
	path = urlArray[0];
    }
    else{
	urlArray.pop();
	path = urlArray.reduce((a,b)=> a+b );
    }
    
    let tokens = tokenizer ( domain );
    tokens =tokens.concat( tokenizer (path ));
    tokens = tokens.filter(tokenIsBigEnough);
    tokens = Array.from(new Set(tokens));
    
    return tokens;
}


function urlToIndexableTokens ( urlStr ) {
    let tokens = urlTokenizer(urlStr);
    
    let metaphoned = [];
    tokens.forEach(function(token){
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
