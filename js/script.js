// The Main JS File

var map;
var canvas;

var viz;

(function(){

	var width = 960;
	var height = 1150;


	/// with this projection it appears that the coords
	/// relate to the canvas in the following way:

	/// long      , lat       : x  , y

	/// UNROTATED
	/// -73.981918, 40.768054 : 384, 73 (Columbus Circle)
	/// -73.976441, 40.714838 : 626, 833 (Williamsburg Bridge & FDR)
	/// -73.999401, 40.708080 : 398, 991 (Brooklyn Bridge & FDR)	

	/// ROTATION APPROXIMATED
	/// -73.981918, 40.768054 : 488, 51 (Columbus Circle)
	/// -73.976441, 40.714838 : 525, 849 (Williamsburg Bridge & FDR)
	/// -73.999401, 40.708080 : 265, 941 (Brooklyn Bridge & FDR)	


	var proj = d3.geo.albers()
		// .center([-74, 40])
		// .rotate([0, 0])
		// .parallels([50, 60])
		.scale( 850000 )
		.translate([-249500, 59150]);

	map = Sketch.create({
		height: height,
		width: width,
		container: document.getElementById('container'),
		autostart: false,
		autoclear: false,
		autopause: false,
		fullscreen: false
	});

	canvas = d3.select('canvas')
		.attr('width', width)
		.attr('height', height)
		.attr('class', 'map');

	d3.json('shapefiles/manhattan_roads.json', function(err, manhattan) {

		canvas.attr('style', 'opacity:1');

		var path = d3.geo.path()
			.projection( proj )
			.context( map );

		map.click = function() {
			console.log('mouse', map.mouse.x, map.mouse.y);
		};
		map.draw = function() {
			map.save();
			map.rotate( 15 * Math.PI/180 ); // doing this to approximate the rotation of true North/South
			path( topojson.feature(manhattan, manhattan.objects.manhattan_roads) );
			map.strokeStyle = 'rgba(0,0,0,0.6)';
			map.stroke();
			map.restore();
		};

		map.draw();
	});


	viz = Sketch.create({
		height: height,
		width: width,
		container: document.getElementById('container'),
		autopause: false,
		fullscreen: false
	});

	var location = {x: 0, y: 0};

	viz.update = function() {
		location = viz.mouse;
	};

	viz.draw = function() {
		viz.save();
		viz.beginPath();
		viz.arc(location.x, location.y, 50, 0, 2 * Math.PI, false);
		viz.fillStyle = "rgba(255, 0, 0, 0.3)";
		viz.fill();
		viz.restore();
	};


})();