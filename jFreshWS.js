var pty = require('pty.js')
	, term
;

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

process.on('message', function(m, skt) {
	if ( typeof(m)!='object' ) return;
	switch(m.o) {
	case 'term':
		if ( !term ) launch_terminal();
		if ( m.d ) term.write(m.d);
		break;
	case 'term-resize':
		if (term) term.resize(m.d.cols, m.d.rows);
		break;
	case 'js':
		break;
	case 'die':
		console.log('Child died...');
		term.destroy();
		process.exit(0);
		break;
	}
});

