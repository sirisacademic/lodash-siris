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
	    	select = _.assign;
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
			return _.inRange(value[key1], firstCommonYear, lastCommonYear);
		});
		filterInPlace(dataset2, function(value) {
			return _.inRange(value[key2], firstCommonYear, lastCommonYear);
		});
	}




	// add mixins here
	_.mixin( { 'join' : join });
	_.mixin( { 'filterInPlace' : filterInPlace});
	_.mixin( { 'trimToTimeFrame' : trimToTimeFrame });

})(_);