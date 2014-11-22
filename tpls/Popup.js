xtc.fn.Popup = function(el, opts) {
	this.el = el;
	this.hidden = false;
	this.opts = opts;
	this.handleEl = this.opts.handle ? this.el.closest(this.opts.handle) : document.body;
	
	this.handleEl.classList.add('Popup-handle');
	this.handleEl.popup = this;
	
	this.el.style.position='fixed';
	this.el.classList.add('Popup');
	this.hide();
	
	xtc.fn.Popup.hookUp();
};

xtc.fn.Popup.defaults = {
	handle: '',
	location: 'top left,top left'
};

xtc.fn.Popup.hookUp = function() {
	if ( xtc.__Popup__ ) return;
	xtc.__Popup__ = true;
	
	document.addEventListener('click', function(ev) {
		var t = ev.target;
		//if it's a handle click, toggle popup
		if ( ev.target.classList.contains('Popup-handle') || (t=ev.target.parent('.Popup-handle')) ) {
			t.popup.toggle();
			
			ev.preventDefault();
			ev.stopPropagation();
			return false;
		}
		//else hide any showing popups
		else { 
			var e = document.querySelectorAll('.Popup'); 
			Array.prototype.forEach.call(e, function(el) { el.popup.hide(); });
		}
	});
};

xtc.fn.Popup.prototype.show = function() {
	if ( !this.hidden ) return;
	this.el.show();
	var p = this.opts.location.split(',');
	this.el.position({my: p[0], at: p[1], of: this.handleEl});
	this.hidden = false;
};

xtc.fn.Popup.prototype.hide = function() {
	if ( this.hidden ) return;
	this.el.hide();
	this.hidden = true;
};

xtc.fn.Popup.prototype.toggle = function() {
	this[this.hidden ? 'show' : 'hide']();
};
