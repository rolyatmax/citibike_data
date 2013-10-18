// The Main JS File

var svg;
var canvas;

(function(){

	var width = 960;
	var height = 1150;

	var proj = d3.geo.albers()
		// .center([40, -74])
		// .rotate([0, 0])
		// .parallels([50, 60])
		.scale( 850000 )
		.translate([-249600, 59300]);

	canvas = d3.select('#container').append('canvas')
		.attr('width', width)
		.attr('height', height);

	var ctx = canvas.node().getContext('2d');

	var path = d3.geo.path()
		.projection( proj )
		.context( ctx );

	d3.json('shapefiles/manhattan_roads.json', function(err, manhattan) {
		console.log(manhattan);


		path( topojson.feature(manhattan, manhattan.objects.manhattan_roads) );
		ctx.strokeStyle = 'rgba(0,0,0,0.4)';
		ctx.stroke();
	});

})();