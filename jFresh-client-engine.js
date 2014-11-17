(function(docEl) {
	var matches = docEl.matchesSelector || docEl.mozMatchesSelector || docEl.webkitMatchesSelector || docEl.oMatchesSelector || docEl.msMatchesSelector;
	if ( !docEl.matches ) Node.prototype.matches = function(selector) {
		return matches.call(this, selector);
	};
})(document.documentElement);
	
	 


jFresh = {
	_dummyContainer: document.createElement('div'),
	_imgs: 'imgs/',
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
	
	__getTemplate: function(tpl) {
		//~ console.log('Building template:', tpl);
		var tplChild, tplRoot = document.getElementById(tpl);
		if (!tplRoot) {
			console.log('Missing Template: ', tpl );
			return;
		}
		var dolly = tplRoot.content.cloneNode(true);
		var elChild, elRoot = dolly.children.length>1 ? dolly.children : dolly.children[0];
		var subTpls = elRoot.querySelectorAll('[tpl]');
		//~ console.log('Building sub templates:', subTpls);
		for (var i=0; i< subTpls.length; i++) {
			var tname = subTpls[i].getAttribute('tpl');
			jFresh.energize( tname, subTpls[i], true );
		}
		return elRoot;
	},
	
	energize2: function(el) {
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
								opts[setting] = el.getAttribute(oName+'-'+setting) || defs[setting];
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
	},
	
	__energize: function(tpl, parent, scaffoldOnly) {
		var p = parent || document.body;
		//~ console.log('jFresh.energize:', tpl, p, scaffoldOnly);
		var el = jFresh.getTemplate(tpl);
		if (!el) {
			//~ console.log('ERROR: Template not found: ', tpl);
			return false;
		}
		p.appendChild(el);
		
		if ( !scaffoldOnly ) {
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
								opts[setting] = el.getAttribute(oName+'-'+setting) || defs[setting];
							}
						}
						var lowerName = oName.substr(0,1).toLowerCase()+oName.substr(1);
						if ( !el.hasOwnProperty(lowerName) ) {
							el[ lowerName ] = new jFresh.fn[ oName ]( el, opts );
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
			if ( el.hasAttribute('fn') ) {
				energizeEl(el);
			}
			Array.prototype.forEach.call(elements, energizeEl, this);
		}
		return el;
	},
	
	init: function(tpl, parent) {
		document.addEventListener('DOMContentLoaded', function(){
			//~ console.log('$$$', $);
			//~ $.extend = jFresh.extend;
			//~ $X = jFresh.energize(tpl, parent);
			$X = jFresh.energize2(tpl);
			//~ $O = new jFresh.fn[startNode](p);
		
		/*
		wm = new jFresh.fn.WindowManager( document.getElementById('WORKSPACE') );
		
		w1 = wm.createWindow({title: 'Win1'});
		w2 = wm.createWindow({title: 'Win2'});
		w3 = wm.createWindow({title: 'Win3'});*/
		
		//~ function appendHtml(parent, html) {
		//~ }

		//~ document.addEventListener('mousemove', function() {
			//~ console.log('body mouse move');
		//~ });

		//~ foo = document.getElementById('foo')
		//~ foo.moveable({handle: 'h1', container: foo.parentNode});

		//~ foo = document.getElementById('foo2')
		//~ foo.moveable({handle: 'h1', container: foo.parentNode});
		//~ .moveable({});
		//~ .appendHtml('<h1>hello world!</h1><h1>hello world!2</h1><h1>hello world!3</h1>');

			//~ console.log(typeof(document.getElementByTagName('body')));
			//~ ='<h1>hello world!</h1><h1>hello world!2</h1><h1>hello world!3</h1>';

		
		});
		
	},
	
	tetherNotify: function(el) {
		if ( !el.__TETHERED__ ) return;
		for(var i =0; i<el.__TETHERED__.length; i++ ) {
			el.__TETHERED__[i].call();
		}
	},
};

document.addEventListener('DOMNodeRemoved', function(ev) {
//~ console.log('R', ev.target, ev.target.__TETHERED__);
	if ( ev.target.__TETHERED__ ) jFresh.tetherNotify(ev.target);
	var subs = ev.target.getElementsByClassName ? ev.target.getElementsByClassName('__TETHERED__') : [];
	for(var i =0; i<subs.length; i++) {
		jFresh.tetherNotify(subs[i]);
	}
});

document.addEventListener('DOMContentLoaded', function(){
	if ( !jFresh.startNode ) jFresh.startNode = document.body;
	jFresh.energize2(jFresh.startNode);
});

//enable shorthands?! :D
//~ $ = jFresh;
//~ $$ = jFresh.fn;



