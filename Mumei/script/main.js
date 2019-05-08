var rf = (function(){
  return window.requestAnimationFrame       ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      function(cb){
          window.setTimeout(cb, 1000 / 60);
      };
})();

var lastTime;
var now;
var dt = 0;
var fps = 60;
var step = 1 / fps;

//map
var map = {
	set:'tile',
	dimensions:{width:40, height:45},
	tile:{width:32, height:32},
	screen:{width:25, height:19}
};
/*****************************/

function Start(canvasBody)
{	
	// Create the canvas
	var canvas = document.createElement("canvas");
	if(canvas.getContext)
	{
		var ctx = canvas.getContext("2d");
		canvas.width = (map.screen.width * map.tile.width)-12;
		canvas.height = (map.screen.height * map.tile.height)-16;

		var b = document.getElementById(canvasBody);
    b.appendChild(canvas);		

		init();
	}
}

function init()
{  
  var now = timestamp();	
  lastTime = now;
	FixedLoop();  
}

function FixedLoop(){
	now = timestamp();
	dt = dt + Math.min(1, (now - lastTime) / 1000);
	while (dt > step) {
	  dt = dt - step;
	  update(step);
	}

	render();

	lastTime = now;
	rf(FixedLoop);
}

function timestamp() {
	var wp = window.performance;
	return wp && wp.now ? wp.now() : new Date().getTime();
}

// Update game objects
function update(dt) {
	
};

function render() {
	
};

window.onload = function() {
	Start("canvasBody");
}
