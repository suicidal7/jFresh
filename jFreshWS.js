var pty = require('pty.js')
	, fs = require('fs')
	, extend = require('extend')
	, term
;

var xpose = {
	pty: pty,
	fs: fs
};

function launch_terminal() {
	term =  pty.spawn('bash', ['-i', '-l'], {
		name: 'xterm-color',
		cols: 80,
		rows: 30,
		cwd: process.env.HOME,
		env: process.env
	});
	
	term.on('data', function(data) {
		process.send({o: 'term', d: data});
	});
}

fs.glob = function(path, _opts) {
	var opts = extend({
		filter: '*',
		details: false,
		folders: true,
		files: true,
		hidden: false,
	}, _opts);
	
	var st, f,
		regExp = opts.filter=='*' || opts.filter=='' ? false : new RegExp('('+opts.filter.replace(/;/g,'|').replace(/\./g,'\\.').replace(/\*/g,'.*')+')$');
		files = fs.readdirSync(path)
	;
	
	//checks
	var rx = function() { return regExp && !regExp.exec(f) };
	var hdn = function() { return !opts.hidden && f[0]=='.' };
	var dtl = function() { 
		//we need stat!?
		if ( opts.details || !opts.folders || !opts.files ) {
			var stat = fs.statSync(path+'/'+f);
			if ( !opts.folders && stat.isDirectory() ) return true;
			if ( !opts.files && stat.isFile() ) return true;
		}
		return false;
	};
	
	for(var i=files.length-1; i>-1; i--) {
		var f = files[i];
		if ( rx() || hdn() || dtl() ) {
			files.splice(i, 1);
			continue;
		}
		if ( opts.details ) {
			st = fs.lstatSync(path+'/'+files[i]);
			st.name = files[i];
			st.mtime = st.mtime.getTime();
			st.atime = st.atime.getTime();
			st.ctime = st.ctime.getTime();
			st.type = (st.isDirectory() ? 'folder' : ( st.isFile() ? 'file' : ( st.isSymbolicLink() ? 'symlink' : 'other' ) ) );
			files[i] = st;
		}
	}
	
//~ console.log('returning', files);
	return files;
};

//~ fs.mimeImages = function() {
	//~ return fs.glob(__dirname+'/public/imgs');
//~ };

//~ console.log( fs.mimeImages() );

process.on('message', function(m, skt) {
	if ( typeof(m)!='object' ) return;
//~ console.log('WS-Client>>> ',m);
	switch(m.o) {
	case 'term':
		if ( !term ) launch_terminal();
		if ( m.d ) term.write(m.d);
		break;
	case 'term-resize':
		if (term) term.resize(m.d.cols, m.d.rows);
		break;
	case 'glob':
		process.send({uid: m.uid, o:'glob', d: fs.glob.apply(fs, m.d)});
		break;
	case 'js':
		// m.d  => [ pkg.fn, arg1, arg2, arg3,... ]
		var fn = m.d.shift().split('.');
		var pkg = fn[0];
		fn = fn[1];
		if ( xpose.hasOwnProperty(pkg) && xpose[pkg].hasOwnProperty(fn) ) {
			try {
				process.send({uid: m.uid, o:'js', 'd': xpose[pkg][fn].apply(this, m.d)});
			} catch(e) {
				process.send({uid: m.uid, o:'js', 'd': undefined, 'error': e.toString()});
			}
		}
		break;
	case 'die':
		console.log('Child died...');
		if (term) term.destroy();
		process.exit(0);
		break;
	}
});

