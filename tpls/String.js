
String.prototype.startsWith = function(what) {
	return this.substr(0, what.length)==what;
};


String.prototype.endsWith = function(what) {
	return this.substr(what.length*-1)==what;
};

String.prototype.lowerFirst = function() {
	return this.substr(0,1).toLowerCase()+this.substr(1);
};

String.prototype.makeVarName = function() {
	return this.lowerFirst().replace(/[^a-z0-9\-]/gi, '_');
};