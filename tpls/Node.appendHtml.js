Node.prototype.appendHtml = function(html) {
	xtc._dummyContainer.innerHTML = html;
	var els = [];
	if ( xtc._dummyContainer.children.length ) {
		while(xtc._dummyContainer.children.length) {
			els.push( xtc._dummyContainer.children[0] );
			this.appendChild(xtc._dummyContainer.children[0]);
		}
	}
	else {
		this.innerHTML += html;
		els.push(html);
	}
	return els.length > 1 ? els : els[0];
};
