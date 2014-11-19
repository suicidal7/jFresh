Node.prototype.moveable = function(options) {
	var me = this;
	
	if ( me.__moveable ) return this;
	me.__moveable = true;
	
	var opts = jFresh.extend(true,{
		handle: false,
		container: false,
	}, options);
//~ console.log('moveable opts', opts, options);
	var el = opts.handle ? this.querySelector(opts.handle) : this;
	var drag;
	var dragInfo = {};
	
	var events = { 
		mousedown: function(ev) {
			drag = opts.handle ? me : el;
			var style = window.getComputedStyle(drag,null);
			dragInfo.width = drag.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);
			dragInfo.height = drag.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
			dragInfo.x = drag.offsetLeft + dragInfo.width - ev.screenX;
			dragInfo.y = drag.offsetTop + dragInfo.height - ev.screenY;
			
			//~ drag.requestPointerLock();
			me.__iframes = document.getElementsByTagName('iframe');
			for(var i=0; i<me.__iframes.length; i++) {
				me.__iframes[i].contentWindow.addEventListener('mouseup', events.mouseup);
				me.__iframes[i].contentWindow.addEventListener('mousemove', events.mousemove);
			}
			window.addEventListener('mouseup', events.mouseup);
			window.addEventListener('mousemove', events.mousemove);

			if ( opts.container ) {
				var dStyle = window.getComputedStyle(drag,null);
				var cStyle = window.getComputedStyle(opts.container, null);
				dragInfo.bounds = {
					left: parseInt(cStyle.paddingLeft) + parseInt(cStyle.marginLeft),
					right: parseInt(cStyle.width) + parseInt(cStyle.marginLeft) - parseInt(dStyle.width) - parseInt(dStyle.marginLeft) - parseInt(dStyle.marginRight),
					top: parseInt(cStyle.paddingTop) + parseInt(cStyle.marginTop),
					bottom: parseInt(cStyle.height) + + parseInt(cStyle.marginTop) - parseInt(dStyle.height) - parseInt(dStyle.marginTop) - parseInt(dStyle.marginBottom),
				};
//~ console.log('MOVE', dragInfo.bounds);
			}

			ev.preventDefault();
			ev.stopPropagation();
			return false;
		},
		mouseup: function(ev) {
//~ console.log('moveable mouseup');
			//~ drag.exitPointerLock();
			drag = false;
			window.removeEventListener('mouseup', events.mouseup);
			window.removeEventListener('mousemove', events.mousemove);
			
			for(var i=0; i<me.__iframes.length; i++) {
				me.__iframes[i].contentWindow.removeEventListener('mouseup', events.mouseup);
				me.__iframes[i].contentWindow.removeEventListener('mousemove', events.mousemove);
			}

			
			if ( opts.container ) { //make sure it stays inside bounds
				var style = window.getComputedStyle(me, null);
				var x = parseInt(style.left),
						y = parseInt(style.top);
						
				if ( x < dragInfo.bounds.left ) x = dragInfo.bounds.left;
				else if ( x > dragInfo.bounds.right ) x = dragInfo.bounds.right;
				if ( y < dragInfo.bounds.top ) y = dragInfo.bounds.top;
				else if ( y > dragInfo.bounds.bottom ) y = dragInfo.bounds.bottom;
				
				me.style.left = x + 'px';
				me.style.top = y + 'px';
			}
		},
		mousemove: function(ev) {
			var y = (ev.screenY + dragInfo.y - dragInfo.height),
				x = (ev.screenX + dragInfo.x - dragInfo.width);
			
			if ( opts.container ) {
				if ( x < dragInfo.bounds.left ) x = dragInfo.bounds.left;
				else if ( x > dragInfo.bounds.right ) x = dragInfo.bounds.right;
				if ( y < dragInfo.bounds.top ) y = dragInfo.bounds.top;
				else if ( y > dragInfo.bounds.bottom ) y = dragInfo.bounds.bottom;
			}
			
			drag.style.left = x + 'px';
			drag.style.top = y + 'px';
			ev.stopPropagation();
			ev.preventDefault();
			return false;
		},
	};
	
	el.addEventListener('mousedown', events.mousedown);
	
	if ( opts.handle ) { //enable ctrl+click to move window from anywhere
		me.addEventListener('mousedown', function(ev) {
			if ( ev.ctrlKey ) return events.mousedown.apply(this, arguments);
		});
	}
	
	return this;
};
