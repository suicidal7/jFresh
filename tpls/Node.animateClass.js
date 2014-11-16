Node.prototype.animateClass = function(cl, end) {
	var me = this;
	var reverse = false;
	
	if ( typeof(end)=='string' && me.classList.contains(end) ) {
//~ console.log('removing ', end);
		me.classList.remove(end);
		reverse = true;
	}

	var func = function() {
		//~ console.log('animation ended', cl, end);
		
		me.classList.remove(cl);
		this.removeEventListener("animationend", func);
		this.removeEventListener("transitionend", func);
		this.removeEventListener("webkitAnimationEnd", func);
		this.removeEventListener("webkitTransitionEnd", func);
		
		if ( end ) {
			switch( typeof(end) ) {
			case 'string': if (!reverse) me.classList.add(end); break;
			case 'function': end.call(this); break;
			}
		}
	};
	this.addEventListener("animationend", func);
	this.addEventListener("transitionend", func);
	this.addEventListener("webkitAnimationEnd", func);
	this.addEventListener("webkitTransitionEnd", func);
	

	this.classList.add(cl);
	
};
