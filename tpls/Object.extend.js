//~ Object.prototype.extend = function() {
//~ extend = function() {
	//~ var i = 0, deepCopy=false, obj;
	//~ if (arguments.length<1) return;
	//~ if (arguments[0] === true) {
		//~ deepCopy = true;
		//~ i++;
	//~ }
	//~ var target = arguments[i++];
	//~ for(;i<arguments.length;i++) {
		//~ //(deep)copy each element into this one...
		//~ obj = arguments[i];
		//~ if ( typeof(obj)!='object') continue;
		//~ for(var k in obj) {
			//~ if (!obj.hasOwnProperty(k)) continue;
			//~ if ( deepCopy && obj[k] instanceof Object && !(obj[k] instanceof Node) ) {
				//~ if ( !target.hasOwnProperty(k) ) target[k] = {};
				//~ target[k].extend(obj[k]);
			//~ }
			//~ else {
				//~ target[k] = obj[k];
			//~ }
		//~ }
	//~ }
	//~ return target;
//~ };

