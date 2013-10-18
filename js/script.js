// The Main JS File

/////// TO DO
/// =========
///  * Map/data fade in animation (the red circle fade in suddenly)
///  * animate the circles
///  * remove Brooklyn data



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
	/// -73.981918, 40.768054 : 489, 37 (Columbus Circle)
	/// -73.976441, 40.714838 : 548, 833 (Williamsburg Bridge & FDR)
	/// -73.999401, 40.708080 : 291, 933 (Brooklyn Bridge & FDR)	


	/// ON THE CANVAS - (0,0) is equivalent to (-74.02529787234042, 40.77040194092827)


	var proj = d3.geo.albers()
		.scale( 850000 )
		.translate([-249500, 59150]);

	var $map = $('<canvas>').attr('height', height).attr('width', width);
	$('#container').append($map);
	var map = $map[0].getContext('2d');

	var canvas = d3.select('canvas')
		.attr('width', width)
		.attr('height', height)
		.attr('class', 'map');

	d3.json('shapefiles/manhattan_roads.json', function(err, manhattan) {

		$('#curtain').css({ opacity: 0 }).on('transitionend', function() {
			$('#curtain').remove();
		});

		$('canvas').css({ opacity: 1 });

		var path = d3.geo.path()
			.projection( proj )
			.context( map );

		map.draw = function() {
			map.save();
			map.rotate( 13.4 * Math.PI/180 ); // doing this to approximate the rotation of true North/South
			path( topojson.feature(manhattan, manhattan.objects.manhattan_roads) );
			map.strokeStyle = 'rgba(0,0,0,0.6)';
			map.stroke();
			map.restore();
		};

		map.draw();

	});


	var viz = Sketch.create({
		height: height,
		width: width,
		container: document.getElementById('container'),
		autopause: false,
		autostart: false,
		fullscreen: false
	});

	var stations = [];
	var bikeData;

	viz.setup = function() {

		var station_url = "data/stations.json";
		var data_url = "data/sorted_data.json";

		var station_promise = $.getJSON(station_url).then(function(data){
			for (var i = 0, len = data.length; i < len; i++) {
				stations.push( new Station(data[i]) );
			}
		});

		var data_promise = $.getJSON(data_url).then(function(data){
			bikeData = data;
		});

		$.when(station_promise, data_promise).then(function(){
			viz.start();
		});

	};

	var p = 0;
	var lastSec = 0;
	var curSlice;

	var SPEED = 2.5;

	viz.update = function() {
		var sec = SPEED * (viz.millis / 1000) | 0;

		if (sec > lastSec) {
			lastSec = sec;
			p += 1;
			curSlice = bikeData[p];

			if (!curSlice || !curSlice.docs || !curSlice.docs.length) {
				p = 0;
				return;
			}

			_.each(stations, function(station){
				var data = _.findWhere(curSlice.docs, { station_id: station.id });
				station.update( data );
			});

			updateTimeDisplay( curSlice );
		}

	};

	viz.draw = function() {
		viz.save();

		_.each(stations, function(station) {
			station.draw(viz);
		});

		viz.restore();
	};



	var Station = function( data ) {

		var loc = convertCoords(data.latitude, data.longitude);

		this.x = loc.x;
		this.y = loc.y;
		this.name = data.stationName;
		this.id = data.id;
		this.bikes = 1;

	};

	Station.prototype = {

		update: function( data ) {
			if (!data) return;
			this.bikes = data.bikes;
		},

		draw: function(ctx) {
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.bikes, 0, 2 * Math.PI, false);
			ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
			ctx.fill();
		}

	};

	var $timeslice = $('.timeslice');
	var days = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' ');

	function updateTimeDisplay( data ) {

		var day = days[data.day];
		var hour = convertHour(data.hour);

		var text = day + ' | ' + hour;

		$timeslice.text( text );
	}

	function convertHour(hour) {
		if (hour === 0) {
			return '12AM';
		}
		if (hour < 12) {
			return hour + 'AM';
		}
		if (hour === 12) {
			return '12PM';
		}
		return (hour - 12) + 'PM';
	}

	function convertCoords(lat, long) {
		// this is the latitude-to-1px ratio
		var lat_norm = 0.00006647679324893937;

		// this is the longitude-to-1px ratio
		var long_norm = 0.00008936170212765288;

		// the lat/long coords for (0,0) on the canvas
		var zeroLat = 40.77040194092827;
		var zeroLong = -74.02529787234042;

		var dlat = zeroLat - lat;
		var y = dlat / lat_norm;

		var dlong = long - zeroLong;
		var x = dlong / long_norm;

		return {
			x: x | 0,
			y: y | 0
		};
	}

	function toggleAnimation() {
		var action = viz.running ? 'stop' : 'start';
		viz[action]();
	}

	////// Events

	$(document).on('keydown', function(e){
		if (e.which === 32) {
			e.preventDefault();
			toggleAnimation();
		}
	});

	$('body').on('click', '.info_btn', function(e){
		toggleAnimation();
	});

	/////// Exports

	window.viz = viz;

})();