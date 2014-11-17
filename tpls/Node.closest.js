Node.prototype.closest = function(sel) {
	var p = this;
	while(!p.matches(sel) && !p.querySelector(sel) && p.parentNode) p = p.parentNode;
	return p.matches(sel) ? p : p.querySelector(sel);
};

Node.prototype.parent = function(sel) {
	var p = this;
	while(!p.matches(sel) && p.parentNode && p.parentNode.matches && p.parentNode.tagName!='HTML') p = p.parentNode;
	return p.matches(sel) ? p : null;
};

Node.prototype.hide = function() {
	var style = window.getComputedStyle(this);
	this.__display__ = style.display;
	this.style.display = 'none';
};

Node.prototype.show = function() {
	this.style.display = this.__display__ || 'block';
};

Node.prototype.toggle = function() {
	this[this.__display__ ? 'show' : 'hide']();
};

Node.prototype.toggleClass = function(cls) {
	this.classList[ this.classList.contains(cls) ? 'remove' : 'add' ](cls);
	return this;
};

//~ Node.prototype.slideHide = function() {
	//~ this.style.transition = 'height 0.5s ease-in-out';
	//~ var me = this;
	//~ setTimeout(function() {
		//~ var style = window.getComputedStyle(me);
		//~ me.__height__ = style.height;
		//~ me.__overflow__ = style.overflow;
		//~ me.style.height = '0px';
		//~ me.style.overflow = 'hidden';
	//~ }, 1);
//~ };

//~ Node.prototype.slideShow = function() {
	//~ if ( !this.__height__ ) return;
	
	//~ this.style.height = this.__height__;
	//~ var onEnd = function() {
		//~ this.style.overflow = this.__overflow__;
		//~ delete this.__height__;
		//~ delete this.__overflow__;
		//~ this.removeEventListener('webkitTransitionEnd', onEnd);
//~ console.log('on end');
	//~ };
	//~ this.addEventListener('webkitTransitionEnd', onEnd);
//~ };


//~ Node.prototype.slideToggle = function() {
	//~ this[this.__height__ ? 'slideShow' : 'slideHide']();
//~ };



Node.prototype.tether = function(cb) {
console.log('tethering to ', this);
	if ( !this.hasOwnProperty('__TETHERED__') ) {
		this.__TETHERED__ = [];
		this.classList.add('__TETHERED__');
	}
	
	this.__TETHERED__.push(cb);
};


Node.prototype.fireEvent = function(event){
	if (document.createEventObject){
		// dispatch for IE
		var evt = document.createEventObject();
		return this.fireEvent('on'+event,evt)
	}
	else{
		// dispatch for firefox + others
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent(event, true, true ); // event type,bubbling,cancelable
		return !this.dispatchEvent(evt);
	}
};



Node.prototype.position = function(args) {
	var opts = jFresh.extend(true, {
		my: 'top left',
		at: 'top left',
		of: ''
	}, args);
	
	if ( !opts.of ) return;
	
	var style = this.getBoundingClientRect();
	var ofStyle = opts.of.getBoundingClientRect();
	
	opts.my = opts.my.split(/\s+/);
	opts.at = opts.at.split(/\s+/);

	if ( opts.my[0] == 'top' ) {
		if ( opts.at[0] == 'top' ) {
			this.style.top = ofStyle.top;
		}
		else if ( opts.at[0] == 'bottom' ) {
			this.style.top = (ofStyle.top+ofStyle.height) +'px';
		}
	}
	else if ( opts.my[0] == 'bottom' ) {
		if ( opts.at[0] == 'top' ) {
			this.style.top = (ofStyle.top-style.height) +'px';
		}
		else if ( opts.at[0] == 'bottom' ) {
			this.style.top = (ofStyle.top+ofStyle.height-style.height) +'px';
		}
	}
	
	if ( opts.my[1] == 'left' ) {
		if ( opts.at[1] == 'left' ) {
			this.style.left = ofStyle.left;
		}
		else if ( opts.at[1] == 'right' ) {
			this.style.left = (ofStyle.left+ofStyle.width)+'px';
		}
	}
	else if ( opts.my[1] == 'right' ) {
		if ( opts.at[1] == 'left' ) {
			this.style.left = (parseInt(ofStyle.left) - parseInt(style.width))+'px';
		}
		else if ( opts.at[1] == 'right' ) {
			this.style.left = (parseInt(ofStyle.left)+parseInt(ofStyle.width)-parseInt(style.width))+'px';
		}
	}
	
}
