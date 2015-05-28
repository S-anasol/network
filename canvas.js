var SCREEN_WIDTH = 100;
var SCREEN_HEIGHT = 100;
var gcanvas = document.createElement("canvas");
var gctx = gcanvas.getContext("2d");
var WORLD_WIDTH = 1000;
var WORLD_HEIGHT = 500;

var gcanvas = document.createElement("canvas");
var gctx = gcanvas.getContext("2d");
gcanvas.width = WORLD_WIDTH;
gcanvas.height = WORLD_HEIGHT;
document.body.appendChild(gcanvas);
	
function getMousePos(canvas, evt) {
	var rect = gcanvas.getBoundingClientRect();
	console.log('rect',rect);
	console.log('real mouse',evt.clientX,evt.clientY);
	return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
}

gcanvas.addEventListener('mouseup', function(evt) {
	var mousePos = getMousePos(gcanvas, evt);
	console.log('mousePos',mousePos);
	game.input(mousePos);
}, false);

document.addEventListener('keydown', function(evt) {
	game.move(evt.keyCode, true);
	//game.play('fly','fly');
}, false);

document.addEventListener('keyup', function(evt) {
	game.move(evt.keyCode, false);
}, false);