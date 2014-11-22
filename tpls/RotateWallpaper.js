xtc.fn.RotateWallpaper = function(el, opts) {
	var me = this;
	me.el = el;
	me.opts = opts;

	function shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex ;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}

	var rotate =function() {
		me.el.style.backgroundImage="url('imgs/wallpapers/"+(me.wallPapers[me.idx++])+"')";
		if ( me.idx>= me.wallPapers.length ) me.idx = 0;
	};

	
//~ setTimeout(function() {
	//request files list
	document.getElementsByClassName('SocketIO')[0].socketIO.send('js', ['fs.glob', localStorage.userHome+'/Pictures/Wallpapers'], function(res) {
		if ( !res || !res.d ) return;
		//~ console.log( 'wpapers', res.d );
		me.wallPapers = res.d;
		shuffle(me.wallPapers);
//~ console.log(me.wallPapers.slice(0,10).join("\n"));
		me.idx=0;
		setInterval(rotate, 60000);
		rotate();
	});
	
	//~ setInterval(me.rotate, 5000);
//~ }, 1000);
};

xtc.fn.RotateWallpaper.prototype.rotate = function() {
	this.el.style.backgroundImage="url('imgs/wallpapers/"+(me.wallPapers[me.idx++])+"')";
};
