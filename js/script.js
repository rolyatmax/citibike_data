// The Main JS File

var ctx;
var canvas;

(function(){

	var width = 960;
	var height = 1150;


	/// with this projection it appears that the coords
	/// relate to the canvas in the following way:
	/// AGH! BUT IT'S NOT WORKING! HELP!
	///
	/// Latitude
	/// 40.768054 : 73
	/// 40.714838 : 833
	/// 40.708080 : 991
	///
	/// Longitude
	/// -73.981918 : 384
	/// -73.976441 : 626
	/// -73.999401 : 398




	var proj = d3.geo.albers()
		// .center([-74, 40])
		// .rotate([0, 0])
		// .parallels([50, 60])
		.scale( 850000 )
		.translate([-249600, 59300]);

	ctx = Sketch.create({
		container: document.getElementById('container'),
		autostart: false,
		fullscreen: false,
		autoclear: false
	});

	canvas = d3.select('canvas')
		.attr('width', width)
		.attr('height', height);

	d3.json('shapefiles/manhattan_roads.json', function(err, manhattan) {

		canvas.attr('style', 'opacity:1');

		var path = d3.geo.path()
			.projection( proj )
			.context( ctx );

		path( topojson.feature(manhattan, manhattan.objects.manhattan_roads) );
		ctx.strokeStyle = 'rgba(0,0,0,0.4)';
		ctx.stroke();

		ctx.click = function() {
			console.log('mouse', ctx.mouse.x, ctx.mouse.y);
		};
	});







})();