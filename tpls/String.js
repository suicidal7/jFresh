
String.prototype.startsWith = function(what) {
	return this.substr(0, what.length)==what;
};


String.prototype.endsWith = function(what) {
	return this.substr(what.length*-1)==what;
};