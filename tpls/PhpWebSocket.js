xtc.fn.PhpWebSocket = function( el, opts ) {
	//extend WebSocket
	this.opts = opts;
	var skt = new WebSocket(this.opts.host);
	for( var fn in xtc.fn.PhpWebSocket.prototype ) {
		if (!xtc.fn.PhpWebSocket.prototype.hasOwnProperty(fn)) continue;
		skt[ fn ] = xtc.fn.PhpWebSocket.prototype[fn];
	}
	
	skt.is_open = false;
	skt.el = el;
	skt.uid = 1;
	skt.callbacks = {};
	skt._queue = [];
	skt.listeners = [];
	
	//~ skt.onopen = function() {};
	//~ skt.onerror = function() {};
	//~ skt.onclose = function() {};
	
	//~ skt.onmessage = function() {};
	
	
	return skt;
}

xtc.fn.PhpWebSocket.defaults = {
	'host': '',
};

xtc.fn.PhpWebSocket.prototype.onopen = function() {
	//handshake / auth
	
	//resend any queued msgs?
	var req;
	while(this._queue.length) {
		req = JSON.stringify(me._queue.shift());
		this.send(req);
	}
	
	this.is_open = true;
	
	for(var k=0; k<this.listeners.length; k++) {
		this.listeners[k].call(this, 'onopen', arguments);
	}

};

xtc.fn.PhpWebSocket.prototype.onclose = function() {
	console.log('PhpWebSocket CLOSED', arguments);
	//TODO: reconnect
	
	this.is_open = false;
	
	for(var k=0; k<this.listeners.length; k++) {
		this.listeners[k].call(this, 'onclose', arguments);
	}

};

xtc.fn.PhpWebSocket.prototype.onerror = function() {
	console.log('PhpWebSocket ERROR', arguments);
	//TODO: reconnect?
	
	for(var k=0; k<this.listeners.length; k++) {
		this.listeners[k].call(this, 'onerror', arguments);
	}

};

xtc.fn.PhpWebSocket.prototype.onmessage = function(msg) {
	var json = JSON.parse( msg.data );
	if ( this.callbacks.hasOwnProperty( json.uid ) ) {
		var cb, 
			cbs = this.callbacks[ json.uid ];
		delete me.callbacks[ json.uid ];
		for(var i=0; i<cbs.length; i++) {
			cb = cbs[i];
			if ( cb[0](json, cb[1]) === false ) return;
		}
	}
	
	//~ me.element.trigger('webSocket-onmsg', [json, me]);
	
	//~ for(var k in json) {
		//~ me.element.trigger('webSocket-onmsg-'+k, [json[k], json.uid, me]);
	//~ }
	
	for(var k=0; k<this.listeners.length; k++) {
		this.listeners[k].call(this, 'msg', json);
	}
};

xtc.fn.PhpWebSocket.prototype.unlisten = function(fn) {
	var idx = this.listeners.indexOf(fn);
	if ( idx >= 0 ) this.listeners.splice(idx, 1);
};

xtc.fn.PhpWebSocket.prototype.listen = function(fn) {
	if ( this.listeners.indexOf(fn) >= 0 ) return;
	this.listeners.push(fn);
};

xtc.fn.PhpWebSocket.prototype.exec = function() {
	var args = Array.prototype.slice.call(arguments);

	var fn = args.shift();
	var cb, apply, cb_data;
	if ( typeof(fn)=='object' ) {
		apply = fn.apply;
		fn = fn.func;
	}
	if ( args.length>1 && typeof(args[args.length-2])=='function' ) {
		cb_data = args.pop();
		cb = args.pop();
	}
	else if ( args.length && typeof(args[args.length-1])=='function' ) {
		cb = args.pop();
	}
	
	var req = {'uid': this.uid++, 'func': fn.split('.'), 'args': args};
	if ( apply ) req.apply = apply;
	if ( cb ) this.callbacks[ req.uid ] = [ [ cb, cb_data ] ];
	
	if ( ! this.is_open  ) {
		this._queue.push(req);
		return req.uid;
	}
	
	this.send(JSON.stringify(req));
	return req.uid;
};
