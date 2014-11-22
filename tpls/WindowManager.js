
xtc.fn.WindowManager = function(workspace, opts) {
	this.el = workspace;
	this.opts = opts;
//~ console.log('WTF');
	if ( workspace.__WindowManager ) return workspace.__WindowManager;
	workspace.__WindowManager = this;
	
	this.el.addEventListener('XTC.NodeRemoved', function(ev) {
		console.log('XTC.NodeRemoved', this,ev.target);
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
	
	this.workspace.addEventListener('XTC.Window', function(ev) {
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
	
	me.hookGlobalListeners();
	window.currentWindowManager = this;
	
	this.workspace.addEventListener('Movable.resize', function(ev) {
		if ( !ev.detail ) return;
		console.log('Movable.resize', ev.detail);
		if ( ev.detail == 'max' ) ev.target.window.maximize();
		else ev.target.window.snap( ev.detail );
	}, true);
	
	this.workspace.addEventListener('XTC.Window.close', function(ev) {
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


	var keyNames = {3: "Enter", 8: "Backspace", 9: "Tab", 13: "Enter", 16: "Shift", 17: "Ctrl", 18: "Alt",
									19: "Pause", 20: "CapsLock", 27: "Esc", 32: "Space", 33: "PageUp", 34: "PageDown", 35: "End",
									36: "Home", 37: "Left", 38: "Up", 39: "Right", 40: "Down", 44: "PrintScrn", 45: "Insert",
									46: "Delete", 59: ";", 61: "=", 91: "Mod", 92: "Mod", 93: "Mod", 107: "=", 109: "-", 127: "Delete",
									173: "-", 186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\",
									221: "]", 222: "'", 63232: "Up", 63233: "Down", 63234: "Left", 63235: "Right", 63272: "Delete",
									63273: "Home", 63275: "End", 63276: "PageUp", 63277: "PageDown", 63302: "Insert"};
	me.keyNames = keyNames;
	me.keyBinds = {};
	(function() {
		// Number keys
		for (var i = 0; i < 10; i++) keyNames[i + 48] = keyNames[i + 96] = String(i);
		// Alphabetic keys
		for (var i = 65; i <= 90; i++) keyNames[i] = String.fromCharCode(i);
		// Function keys
		for (var i = 1; i <= 12; i++) keyNames[i + 111] = keyNames[i + 63235] = "F" + i;
	})();
	
	me.keyChain = [];
	me.overrideSystemKeys = {};
	
	
	//~ me.bindKey('F5', function(ev) { return false; }, null, true);
	me.bindKey('Alt+Left', function(ev) { var win = me.getActive(); win.window.snap('left'); });
	me.bindKey('Alt+Right', function(ev) { var win = me.getActive(); win.window.snap('right'); });
	me.bindKey('Alt+Up', function(ev) { var win = me.getActive(); win.window.maximize(true); });
	me.bindKey('Alt+Down', function(ev) { var win = me.getActive(); win.window.minimize({restore: true}); });
};

xtc.fn.WindowManager.defaults = {
	windowTpl: 'XTC.Window',
}


xtc.fn.WindowManager.prototype.windowFromElement = function(el) {
	while(el && !el.classList.contains('wm-window') && el.parentNode ) el = el.parentNode;
	return el.classList.contains('wm-window') ? el : null;
};

xtc.fn.WindowManager.prototype.activateWindow = function(win) {
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
	win.dispatchEvent(new CustomEvent('XTC.Window', {detail: 'activated'}) );
};

xtc.fn.WindowManager.prototype.getActive = function() {
	return this.windows.tabChain[ this.windows.tabChain.length - 1 ];
};


xtc.fn.WindowManager.prototype.createWindow = function(args) {
	var win = xtc.fn.Template.energize( this.opts.windowTpl, this.el );

	this.windows.chain.push(win);
	this.activateWindow(win);
	
	return win;
};

xtc.fn.WindowManager.prototype.hookGlobalListeners = function() {
	if ( window.__WindowManagerHooked__ ) return;
	window.__WindowManagerHooked__ = true;
	
	window.addEventListener('keydown', function(ev) {
		if ( window.currentWindowManager && window.currentWindowManager.onKeyDown.call(window.currentWindowManager, ev)===false ) {
			ev.preventDefault();
			ev.stopPropagation();
			return false;
		}
	},true);
	window.addEventListener('keyup', function(ev) {
		if ( window.currentWindowManager && window.currentWindowManager.onKeyUp.call(window.currentWindowManager, ev)===false ) {
			ev.preventDefault();
			ev.stopPropagation();
			return false;
		}
	},true);
	
},

xtc.fn.WindowManager.prototype.bindKey = function( binding, cb, contain, overrideSystem ) {
	var me=this;
	if ( !me.keyBinds.hasOwnProperty(binding) ) me.keyBinds[binding] = [];
	me.keyBinds[binding].push([cb, contain]);
	if ( overrideSystem ) me.overrideSystemKeys[ binding ] = true;
};

xtc.fn.WindowManager.prototype.onKeyDown = function( ev ) {
	var me = this;
	
	var key = me.keyNames[ev.keyCode];
//~ console.log('keydown', key);
	if ( this.overrideSystemKeys.hasOwnProperty(key) ) {
			ev.preventDefault();
			ev.stopPropagation();
			return false;
	}
}

xtc.fn.WindowManager.prototype.onKeyUp = function( ev ) {
	var me = this;
	
	var key = me.keyNames[ev.keyCode];
	var binding = [];
	if (ev.ctrlKey) binding.push('Ctrl');
	if (ev.altKey) binding.push('Alt');
	if (ev.shiftKey) binding.push('Shift');
	if (ev.modKey) binding.push('Mod');
	if ( binding.indexOf(key)<0 ) binding.push(key);
	binding = binding.join('+');
//~ console.log('keyup', binding);
	if ( me.keyBinds.hasOwnProperty(binding) ) {
//~ console.log('keyup found', binding);

		var bs = me.keyBinds[binding];
		var isCancel;
		for(var i=0; i<bs.length && (!bs[i][1] || bs[i][1].contains(ev.target) ) && (isCancel=bs[i][0](ev))!==false; i++);
		if ( isCancel===false ) {
			ev.preventDefault();
			ev.stopPropagation();
			return false;
		}
	}
};

//helpers?!
Node.prototype.$WM = function() { return this.closest('.WindowManager') };
$WM = function() { return window.currentWindowManager; };


