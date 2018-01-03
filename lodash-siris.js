(function (_) {
 
    if(_ == undefined)
        return;
 
    // Code from : http://learnjsdata.com/combine_data.html
    // combine data sets by one or more attributes. A way
    // to simulate SQL joins if we consider javascript collections
    // as tables    
    function join(lookupTable, mainTable, lookupKey, mainKey, select) {
        var l = lookupTable.length,
            m = mainTable.length,
            lookupIndex = [],
            output = [];
 
        // the select function determines how to join the two objects
        // that are going to be merged. That's useful to customize the
        // output, specially in cases where both objects have properties
        // with the same name and we want to avoid collisions. But for cases
        // where we just to perform a natural join, then consider not
        // to pass the 'select' paramter and add the logic here
        if(select == undefined) {
            select = function(x,y) {
                return _.assign({}, [x, y])
            };
        }           
 
        for (var i = 0; i < l; i++) { // loop through l items
            var row = lookupTable[i];
            lookupIndex[row[lookupKey]] = row; // create an index for lookup table
        }
        for (var j = 0; j < m; j++) { // loop through m items
            var y = mainTable[j];
            var x = lookupIndex[y[mainKey]]; // get corresponding row from lookupTable
 
            // get sure both object have the same key, otherwise
            // do not try to merge and do not add to the output
            if(x)
                output.push(select(y, x)); // select only the columns you need
        }
        return output;
    };


    // to filter an array in-place
    var filterInPlace = function(arr, conditionFunc) {
        var i = 0,
            j = 0;
 
        while(i < arr.length) {
            if( conditionFunc(arr[i], i, arr) )
                arr[j++] = arr[i];
            i++;
        }
        arr.length = j;
    };



    // given two datasets that contain yearly data, filter them by the
    // yearly time frame common in both datasets. They arrays ara modified
    // in-place
    function trimToTimeFrame(dataset1, dataset2, key1, key2) {
        var firstCommonYear = _.max([
                _.min(_.map(dataset1, key1), key1),
                _.min(_.map(dataset2, key2), key2)
            ]),
            lastCommonYear = _.min([
                _.max(_.map(dataset1, key1), key1),
                _.max(_.map(dataset2, key2), key2)
            ]);
 
        filterInPlace(dataset1, function(value) {
            return _.inRange(value[key1], firstCommonYear, lastCommonYear + 1);
        });
        filterInPlace(dataset2, function(value) {
            return _.inRange(value[key2], firstCommonYear, lastCommonYear + 1);
        });
    }



    /**
     * Same functionality as tydir:spread function of the R language
     * arguments:
            data:           data frame
            key:            column values to convert to multiple columns
            value:          single column values to convert to multiple columns' values
            fill:           If there isn't a value for every combination of the other variables and the key
                            column, this value will be substituted
            convert:        if TRUE will automatically convert values to logical, integer, numeric, complex or
                            factor as appropriate
     */
    function spread(data, key, value, fill) {
        // the new collection
        var output = [],
          column_values = _.uniq(_.map(data, key));
 
        // all those columns apart from key and vaule are the columns
        // we want to group by, and convert each group from a long format
        // to a wide format. So group for a composed key made up from
        // all these column names
        var column_keys = _.difference(
            _.keys(_.first(data)),
            [key, value]
        );
 
        var groups = _.groupBy(data, function(row) {
            return _.values(_.pick(row, column_keys)).join('###');
        });
 
        _.values(groups).forEach(function(group) {
            var obj = {};
            
            column_keys.forEach(function(column_key) {
              obj[column_key] = _.first(group)[column_key];
            });
 
            column_values.forEach(function(column_value) {
                // in order to be tidy data, each group of rows should contain
                // the same set of unique values present in the key column, otherwise
                // the tidy structure will creates combinations of variables that do
                // not exist in the original data set. In that case the combination is
                // filled with the value specified in the FILL parameter function or
                // in the last case, by an undefined value
                if(objWithValueOfKeyColumn = _.find(group, [key, column_value]))
                    obj[column_value] = objWithValueOfKeyColumn[value];
                else
                    obj[column_value] = fill || undefined;
            })
 
            output.push(obj);
        });
 
      return output;
    }


    /**
    * Title Caps
    * 
    * Ported to JavaScript By John Resig - http://ejohn.org/ - 21 May 2008
    * Original by John Gruber - http://daringfireball.net/ - 10 May 2008
    * License: http://www.opensource.org/licenses/mit-license.php
    *   The code handles a number of edge cases:
        -   It knows about small words that should not be capitalized. Not all style guides use the same list of words — for example, many      lowercase with, but I do not. The list of words is easily modified to suit your own taste/rules: “a an and as at but by en          for if in of on or the to v[.]? via vs[.]?” (The only trickery here is that “v” and “vs” include optional dots, expressed in        regex syntax.)
        -   The script assumes that words with capitalized letters other than the first character are already correctly capitalized. This      means it will leave a word like “iTunes” alone, rather than mangling it into “ITunes” or, worse, “Itunes”.
        -   It also skips over any words with line dots; “example.com” and “del.icio.us” will remain lowercase.
        -   It has hard-coded hacks specifically to deal with odd cases I’ve run into, like “AT&T” and “Q&A”, both of which contain small       words (at and a) which normally should be lowercase.
        -   The first and last word of the title are always capitalized, so input such as “Nothing to be afraid of” will be turned into        “Nothing to Be Afraid Of”.
        -   A small word after a colon will be capitalized.
    * arguments:
            title   The string to be capitalized
    */
    function titleCaps(title) {
        var small = "(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)";
        var punct = "([!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)";
        
        var parts = [], 
            split = /[:.;?!] |(?: |^)["Ò]/g, 
            index = 0;
        
        function lower(word)    {
            return word.toLowerCase();
        }
        
        function upper(word){
            return word.substr(0,1).toUpperCase() + word.substr(1);
        }

		while (true) {
			var m = split.exec(title);

			parts.push( title.substring(index, m ? m.index : title.length)
				.replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, function(all){
					return /[A-Za-z]\.[A-Za-z]/.test(all) ? all : upper(all);
				})
				.replace(RegExp("\\b" + small + "\\b", "ig"), lower)
				.replace(RegExp("^" + punct + small + "\\b", "ig"), function(all, punct, word){
					return punct + upper(word);
				})
				.replace(RegExp("\\b" + small + punct + "$", "ig"), upper));
			
			index = split.lastIndex;
			
			if ( m ) parts.push( m[0] );
			else break;
		}
		
		return parts.join("").replace(/ V(s?)\. /ig, " v$1. ")
			.replace(/(['Õ])S\b/ig, "$1s")
			.replace(/\b(AT&T|Q&A)\b/ig, function(all){
				return all.toUpperCase();
			});
    }




    // add mixins here
    _.mixin( { 'join' : join });
    _.mixin( { 'filterInPlace' : filterInPlace});
    _.mixin( { 'trimToTimeFrame' : trimToTimeFrame });
    _.mixin( { 'spread' : spread });
    _.mixin( { 'titleCaps' : titleCaps });
 
})(_);