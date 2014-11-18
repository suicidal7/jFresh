//Takes in an element that is referencing templates and goes
// over them and replaces them with the templated codes
jFresh.fn.Template = function(el, opts) {
	this.el = el;
	this.opts = opts;
	
	//~ this.parseEl(el);
	this.loadTemplate(this.opts.id, this.el);
};

jFresh.fn.Template.defaults = {
	'id': ''
};

//create and energize a template
jFresh.fn.Template.energize = function(tpl, el) {
	var tplEl = jFresh.fn.Template.prototype.loadTemplate( tpl, el);
	if ( !tplEl ) return;
	//~ for(var i=0; i<tplEl.length; i++) {
		//~ jFresh.energize2( tplEl[i] );
	//~ }
	return tplEl.length>1 ? tplEl : tplEl[0];
},

//parses el for tpl attrs and replaces the contents accordingly
// while recursing on children
jFresh.fn.Template.prototype.parseEl = function(el) {
	if ( el.hasAttribute('tpl') ) {
		this.loadTemplate(el.getAttribute('tpl'), el);
	}
	var subTpls = el.querySelectorAll('[tpl]');
	for (var i=0; i< subTpls.length; i++) {
		this.parseEl( subTpls[i] );
	}
};

jFresh.fn.Template.prototype.loadTemplate = function(tpl, container) {
	//~ console.log('Building template:', tpl);
	var tplChild, tplRoot = document.getElementById(tpl);
	if (!tplRoot) {
		if (tpl.indexOf('<')<0) console.log('Missing Template: ', tpl );
		return;
	}
	var dolly = tplRoot.content.cloneNode(true);
	var tplEl = Array.prototype.slice.call(dolly.children); //dolly.children.length>1 ? dolly.children : dolly.children[0]
	//~ var tt,dummies;
	for(var i=0; i<tplEl.length; i++) {
		tt = tplEl[i];
		//~ if ( tt.tagName=='TEMPLATE' ) continue;
		//~ dummies = tt.getElementsByTagName('template');
		//~ while(dummies.length) dummies[0].remove();
		
		container.appendChild( tplEl[i] );
		jFresh.energize2( tplEl[i] , container);
	}
	
	return tplEl;
};

