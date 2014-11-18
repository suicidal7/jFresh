(function(docEl) {
	var matches = docEl.matchesSelector || docEl.mozMatchesSelector || docEl.webkitMatchesSelector || docEl.oMatchesSelector || docEl.msMatchesSelector;
	if ( !docEl.matches ) Node.prototype.matches = function(selector) {
		return matches.call(this, selector);
	};
})(document.documentElement);
	
	 


jFresh = {
	_dummyContainer: document.createElement('div'),
	_imgs: 'imgs/',
	_onBeforeUnloadChain: [],
	startNode: null,
	
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
	
	energize2: function(el, container) {
		//~ console.log('Energizing Element', el);
//~ return;
			var energizeEl = function(el, idx, arr) {
//~ console.log('energizeEl', this);
				var fnArray = el.getAttribute('fn').split(' ');
				for(var k=0; k<fnArray.length; k++) {
					var defs, opts, oName = fnArray[k];
					if ( jFresh.fn.hasOwnProperty(oName) ) {
						opts = {};
						defs = jFresh.fn[ oName ].defaults;
						if ( defs ) { //if app has default configurable params, try to read their values from element's attributes...
							for(var setting in defs ) {
								opts[setting] = el.getAttribute(oName+'-'+setting) || container.getAttribute(oName+'-'+setting) || defs[setting];
							}
						}
						var lowerName = oName.substr(0,1).toLowerCase()+oName.substr(1);
						if ( !el.hasOwnProperty(lowerName) ) {
							el[ lowerName ] = new jFresh.fn[ oName ]( el, opts );
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
			Array.prototype.forEach.call(elements, energizeEl, this);
			
			el.fireEvent('ready');
	},
	
	init: function(tpl, parent) {
		
		//notify tethered elements when a dom node is removed
		document.addEventListener('DOMNodeRemoved', function(ev) {
			if ( ev.target.__TETHERED__ ) jFresh.tetherNotify(ev.target);
			var subs = ev.target.getElementsByClassName ? ev.target.getElementsByClassName('__TETHERED__') : [];
			for(var i =0; i<subs.length; i++) {
				jFresh.tetherNotify(subs[i]);
			}
		});

		document.addEventListener('DOMContentLoaded', function(){
			if ( !jFresh.startNode ) jFresh.startNode = document.body;
			$X = jFresh.energize2(jFresh.startNode); //startup our engine...
		});
		
		var defBeforeUnload = window.onbeforeunload;
		window.onbeforeunload = function() {
			if ( defBeforeUnload ) defBeforeUnload();
			for(var i=0; i<jFresh._onBeforeUnloadChain.length; i++) jFresh._onBeforeUnloadChain[i]();
		};
	},
	
	tetherNotify: function(el) {
		if ( !el.__TETHERED__ ) return;
		for(var i =0; i<el.__TETHERED__.length; i++ ) {
			el.__TETHERED__[i].call();
		}
	},
	
	onBeforeUnload: function(fn) {
		jFresh._onBeforeUnloadChain.push(fn);
	},
};

jFresh.init();

//enable shorthands?! :D
//~ $ = jFresh;
//~ $$ = jFresh.fn;



