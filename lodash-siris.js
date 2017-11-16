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
	        output.push(select(y, x)); // select only the columns you need
	    }
	    return output;
	};


	// add mixins here
	_.mixin( { 'join' : join });

})(_);