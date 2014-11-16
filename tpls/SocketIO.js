jFresh.fn.SocketIO = function( el, opts ) {
	var me = this;
	this.el = el;
	this.opts = opts;
	this._uid = 1;
	this._callbacks = {};
	this._queue = [];
	
	this.skt = io.connect(this.opts.host, {'force new connection': true});
	
	this.is_open = false;
	
	el.tether(function() {
		me.skt.disconnect();
	});
	
	
	var serveCallbacks = function( key, data ) {
		if ( ! me._callbacks.hasOwnProperty( key ) ) return;
		var cbs = me._callbacks[ key ];
		for(var i=0; i<cbs.length; i++) {
			cbs[i].call(me, data);
		}
	};
	
	me.skt.on('autherror', function(nfo) {
		console.log('autherror', nfo);
		var p = me.el.parent(me.opts.authRoot);
		if ( p ) {
			p.classList.add( me.opts.authClass );
		}
		else {
			console.log('SocketIO parent not found:', me.el, me.opts.authRoot);
		}
	});
	
	me.skt.on('sessionKey', function(nfo) {
		localStorage.userKey = nfo.key;
		localStorage.user = nfo.user;
		me.is_open = true;
		me.el.parent(me.opts.authRoot).classList.remove( me.opts.authClass );
		serveCallbacks('sessionKey', nfo);
		
		//send Queued
		while(me._queue.length) {
			me.send.apply(me, me._queue.shift());
		}
	});
	
	me.skt.on('disconnect', function() {
		this.is_open = false;
	});
	
	me.skt.on('d', function(msg) {
		if ( msg.uid ) {
			serveCallbacks(msg.uid, msg);
		}
		if ( msg.o ) {
			serveCallbacks(msg.o, msg.d);
		}
	});
	
	me.skt.on('connect', function() {
		if ( localStorage.userKey ) {
			me.skt.emit('relog', localStorage.userKey);
		}
		else {
			var p = me.el.parent(me.opts.authRoot);
			if ( p ) p.classList.add( me.opts.authClass );
		}
	});
	
	me.skt.on('reconnect', function() {
		if ( localStorage.userKey ) {
			me.skt.emit('relog', localStorage.userKey);
		}
	});
	//~ return skt;
};

jFresh.fn.SocketIO.defaults = {
	'host': document.location.origin.replace('http://','ws://').replace('https://','wss://'),
	authRoot: '.desktop-wrapper', //el.parent(authRoot)
	authClass: 'login-required'
};

jFresh.fn.SocketIO.prototype.on = function(cmd, cb) {
	if ( !this._callbacks.hasOwnProperty(cmd) ) this._callbacks[cmd] = [];
	this._callbacks[cmd].push(cb);
};

jFresh.fn.SocketIO.prototype.login = function(user, pwd) {
	this.skt.emit('login', user, pwd);
};

jFresh.fn.SocketIO.prototype.send = function(cmd, data, cb) {
	if ( ! this.is_open ) {
		this._queue.push([cmd,data,cb]);
		return;
	}
	var pkt = {uid: this._uid++, o: cmd, d: data};
	if ( cb ) {
		this._callbacks[ pkt.uid ] = [ cb ];
	}
	this.skt.emit('d', pkt);
};


