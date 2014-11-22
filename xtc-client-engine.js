(function(docEl) {
	var matches = docEl.matchesSelector || docEl.mozMatchesSelector || docEl.webkitMatchesSelector || docEl.oMatchesSelector || docEl.msMatchesSelector;
	if ( !docEl.matches ) Node.prototype.matches = function(selector) {
		return matches.call(this, selector);
	};
})(document.documentElement);
	
	 


xtc = {
	_dummyContainer: document.createElement('div'),
	_imgs: 'imgs/',
	_onBeforeUnloadChain: [],
	_globalHooks: {}, //stores which ojbects we've intialized global hooks for already
	startNode: null,
	
	typeAssociations: {
		'application/pdf': 'XTC.DocViewer',
		'application/doc': 'XTC.DocViewer',
		'text/plain': 'XTC.DocViewer',
		'image': 'XTC.DocViewer',
	}, //todo: load this on login
	
	fn: {
	},
	
extend: function() {
	var i = 0, deepCopy=false, obj;
	if (arguments.length<1) return;
	if (arguments[0] === true) {
		deepCopy = true;
		i++;
	}
	var target = arguments[i++];
	for(;i<arguments.length;i++) {
		//(deep)copy each element into this one...
		obj = arguments[i];
		if ( typeof(obj)!='object') continue;
		for(var k in obj) {
			if (!obj.hasOwnProperty(k)) continue;
			if ( deepCopy && obj[k] instanceof Object && !(obj[k] instanceof Node) ) {
				if ( !target.hasOwnProperty(k) ) target[k] = {};
				target[k].extend(obj[k]);
			}
			else {
				target[k] = obj[k];
			}
		}
	}
	return target;
},

	_checkGlobalHooks: function( oName ) {
		if ( xtc._globalHooks.hasOwnProperty(oName) ) return;
		xtc._globalHooks[oName]=1;
		if (xtc.fn[oName].globalHooks) xtc.fn[oName].globalHooks();
	},
	
	energize2: function(el, container) {
		//~ console.log('Energizing Element', el);
//~ return;
			var energizeEl = function(el, idx, arr) {
//~ console.log('energizeEl', this);
				var fnArray = el.getAttribute('fn').split(' ');
				for(var k=0; k<fnArray.length; k++) {
					var defs, opts, oName = fnArray[k];
					if ( xtc.fn.hasOwnProperty(oName) ) {
						opts = {};
						defs = xtc.fn[ oName ].defaults;
						if ( defs ) { //if app has default configurable params, try to read their values from element's attributes...
							for(var setting in defs ) {
								opts[setting] = el.getAttribute(oName+'-'+setting) || container.getAttribute(oName+'-'+setting) || defs[setting];
							}
						}
						var lowerName = oName.substr(0,1).toLowerCase()+oName.substr(1);
						if ( !el.hasOwnProperty(lowerName) ) {
							xtc._checkGlobalHooks( oName );
							
							el[ lowerName ] = new xtc.fn[ oName ]( el, opts );
							el[ lowerName ].el = el;
							el[ lowerName ].otps = opts;
							el.classList.add(oName);
						}
						else {
							console.log('WARNING Element Already Energized with: ', oName, el);
						}
					}
					else {
						console.log('Missing Energizer: ', oName, el);
					}
				}
				
			};
			//energize all elements with their associated fn's
			var elements = el.querySelectorAll('[fn]');
			if ( el.hasAttribute('fn') ) energizeEl(el);
//~ console.log('Energizing children', elements, el);
			for(var z=0; z<elements.length; z++) energizeEl( elements[z] );
			
			el.fireEvent('ready');
	},
	
	init: function(tpl, parent) {
		//~ var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
		//~ document.addEventListener(mousewheelevt, function(ev) {
			//~ if ( ev.ctrlKey ) {
				//~ ev.preventDefault();
				//~ ev.stopPropagation();
				//~ return false;
			//~ }
		//~ });
		
		//notify tethered elements when a dom node is removed
		document.addEventListener('DOMNodeRemoved', function(ev) {
			if ( ev.target.__TETHERED__ ) xtc.tetherNotify(ev.target);
			var subs = ev.target.getElementsByClassName ? ev.target.getElementsByClassName('__TETHERED__') : [];
			for(var i =0; i<subs.length; i++) {
				xtc.tetherNotify(subs[i]);
			}
		});

		document.addEventListener('DOMContentLoaded', function(){
			if ( !xtc.startNode ) xtc.startNode = document.body;
			$X = xtc.energize2(xtc.startNode); //startup our engine...
		});
		
		var defBeforeUnload = window.onbeforeunload;
		window.onbeforeunload = function() {
			if ( defBeforeUnload ) defBeforeUnload();
			for(var i=0; i<xtc._onBeforeUnloadChain.length; i++) xtc._onBeforeUnloadChain[i]();
		};
	},
	
	tetherNotify: function(el) {
		if ( !el.__TETHERED__ ) return;
		for(var i =0; i<el.__TETHERED__.length; i++ ) {
			el.__TETHERED__[i].call();
		}
	},
	
	onBeforeUnload: function(fn) {
		xtc._onBeforeUnloadChain.push(fn);
	},
	
	uuid: function() {
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = (d + Math.random()*16)%16 | 0;
				d = Math.floor(d/16);
				return (c=='x' ? r : (r&0x7|0x8)).toString(16);
		});
		return uuid;
	},

	setCookie: function(cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires="+d.toUTCString();
		document.cookie = cname + "=" + cvalue + "; " + expires;
	},
	
};

xtc.init();

//enable shorthands?! :D
//~ $ = xtc;
//~ $$ = xtc.fn;



