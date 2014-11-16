
jFresh.fn.WindowManager = function(workspace, opts) {
	this.el = workspace;
	this.opts = opts;
//~ console.log('WTF');
	if ( workspace.__WindowManager ) return workspace.__WindowManager;
	workspace.__WindowManager = this;
	
	this.el.addEventListener('jFresh.NodeRemoved', function(ev) {
		console.log('jFresh.NodeRemoved', this,ev.target);
	},true);
	
	var me = this;
	this.windows = {
		chain: [],
		tabChain: [],
	};
	this.workspace = workspace;
	this.lastCoords = 0; //todo: make this better
	
	this.workspace.addEventListener('App.title', function(ev) {
		var t = ev.target.parent('.wm-window');
		if ( t ) t.window.title = ev.detail;
	}, true);
	
	this.workspace.addEventListener('jFresh.Window', function(ev) {
//~ console.log('window event', ev.detail, ev.target.window, ev);
		if ( ev.detail == 'close' ) {
			//window going by by! take it off the chains
			var idx = me.windows.chain.indexOf(ev.target);
			if ( idx>=0 ) me.windows.chain.splice(idx,1);
			idx = me.windows.tabChain.indexOf(ev.target);
			if ( idx>=0 ) me.windows.tabChain.splice(idx,1);
			
			//if it was the active window, activate last in tabChain
			if ( ev.target.classList.contains('active') && me.windows.tabChain.length ) {
				me.activateWindow( me.windows.tabChain[ me.windows.tabChain.length-1 ] );
			}
		}
	}, true);
	
	this.workspace.addEventListener('mousedown', function(ev) {
		//set active window!
		var w = ev.target;
		if ( ev.target.classList.contains('wm-window') || (w=ev.target.parent('.wm-window')) ) {
//~ console.log('activating', w, ev.target, ev.target.parent('.wm-window'));
			me.activateWindow(w);
		}
		/*
		var win, windows = me.windows.chain;
		for(var i=0; i<windows.length; i++) {
			win = windows[i];
//~ console.log('win click', win.window);
			if ( ev.target === win || win.contains(ev.target) ) {
				//~ win.activate();
				win.classList.add('active');
			}
			else {
				win.classList.remove('active');
			}
		}*/
		
		//catch clicks to window buttons
		//~ if ( ev.target.parentNode.classList.contains('wm-window-buttons') ) {
			//~ me[ ev.target.getAttribute('action')+'Window' ].call(me, me.windowFromElement( ev.target ) );
			//~ ev.preventDefault();
			//~ ev.stopPropagation();
			//~ return false;
		//~ }
	
	}, true);  //forward chain catching, so we prevent header moving clicks when we click buttons!
	
	this.workspace.addEventListener('jFresh.Window.close', function(ev, data) {
		console.log('close', ev.detail);
		var w = ev.detail,
			idx = me.windows.chain.indexOf(w);
		
		me.windows.chain.splice( idx, 1);
	
	//~ win.addEventListener("animationend", function() {
		//~ win.remove();

		//~ if ( me.windows.chain.length)
			//~ me.activateWindow(me.windows.chain[me.windows.chain.length-1]);
	//~ });

	}, true);
};

jFresh.fn.WindowManager.defaults = {
	windowTpl: 'jFresh.Window',
}


jFresh.fn.WindowManager.prototype.windowFromElement = function(el) {
	while(el && !el.classList.contains('wm-window') && el.parentNode ) el = el.parentNode;
	return el.classList.contains('wm-window') ? el : null;
};

jFresh.fn.WindowManager.prototype.activateWindow = function(win) {
	var me = this;
	//restore window if minimized
	if ( win.classList.contains('minimized') ) {
		win.window.restore();
	}
	else if ( win.classList.contains('active') ) return;
	
	//deactivate any active sibling windows
	for(var i=0; i<win.parentNode.children.length; i++) {
		win.parentNode.children[i].classList.remove('active');
	}
	var currIdx = this.windows.tabChain.indexOf(win);
	if ( currIdx ) this.windows.tabChain.splice(currIdx, 1);
	this.windows.tabChain.push(win);
	
	win.classList.add('active');
	win.dispatchEvent(new CustomEvent('jFresh.Window', {detail: 'activated'}) );
};


jFresh.fn.WindowManager.prototype.createWindow = function(args) {
	var win = jFresh.fn.Template.energize( this.opts.windowTpl, this.el );

	this.windows.chain.push(win);
	this.activateWindow(win);
	
	return win;
};

/*
for(var k in jFresh.fn) {
	if ( !jFresh.fn.hasOwnProperty(k) ) continue;
	var o = jFresh.fn[k];
	Node.prototype.
}
*/

//may not implement!?
/*
Node.prototype.windowManager = function(opts) {
	var me = this;
	
	if ( me.windowManager ) {
console.log('dafak', me);
		return arguments.length ? me.windowManager.exec.apply(me.windowManager, arguments) : me.windowManager;
	}
	//~ me.windowManager = new jFresh.fn.WindowManager(this, opts);
console.log('created new windowManager', me);
	return me.windowManager;
};
*/

