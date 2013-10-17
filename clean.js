/// Cleaning stuff

var fs = require('fs');
var _und = require('underscore');
var MongoClient = require('mongodb').MongoClient;

var db;

MongoClient.connect('mongodb://127.0.0.1:27017/citibike', function(err, database){
	if (err) throw err;

	db = database;

	var collection = db.collection('bikes');

	collection.find().toArray( parseData );

});

function parseData(err, data) {

	// only using a small portion of the data
	// data.length = data.length / 2 | 0;

	console.log('data loaded and using: ', data.length);

	_und.each( data, parseDate );

	data = _und.groupBy( data, function(doc){
		return doc.day + ',' + doc.hour;
	});

	console.log('Grouped!');

	data = _und.map( data, function(docs, prop) {
		// reformatting the now-grouped data
		var timeslice = {};
		var bits = prop.split(',');
		timeslice.day = parseInt(bits[0], 10);
		timeslice.hour = parseInt(bits[1], 10);

		// aggregate by doc id
		docs = _und.groupBy( docs, function(doc){
			return doc.station_id;
		});

		// reduce to averages
		docs = _und.map( docs, function(aggs, prop){
			var bikes_total = _und.reduce(aggs, function(memo, doc){
				return memo + doc.bikes;
			}, 0);
			var spaces_total = _und.reduce(aggs, function(memo, doc){
				return memo + doc.spaces;
			}, 0);
			var docks_total = _und.reduce(aggs, function(memo, doc){
				return memo + doc.docks;
			}, 0);
			var averages = {
				station_id: parseInt(prop, 10),
				bikes: bikes_total / aggs.length | 0,
				spaces: spaces_total / aggs.length | 0,
				docks: docks_total / aggs.length | 0
			};
			return averages;
		});

		timeslice.docs = docs;
		return timeslice;
	});

	//// finally, sort the data
	data = _und.sortBy(data, function(doc){
		return (doc.day * 100) + doc.hour;
	});

	console.log('finished with ', data.length, ' docs - Ex: ', data[0]);

	closeAndWrite(data);
}

function parseDate(doc) {
	var date = new Date(doc.executionTime);

	// these are the new props
	doc.day = date.getDay();
	doc.hour = date.getHours();
	doc.station_id = doc.id;
	doc.bikes = doc.availableBikes;
	doc.spaces = doc.availableDocks;
	doc.docks = doc.totalDocks;

	// save memory and delete these props
	delete doc.city;
	delete doc.altitude;
	delete doc.stAddress2;
	delete doc.lastCommunicationTime;
	delete doc.postalCode;
	delete doc.statusValue;
	delete doc.testStation;
	delete doc.latitude;
	delete doc.longitude;
	delete doc.stAddress1;
	delete doc.landMark;
	delete doc.statusKey;
	delete doc.location;
	delete doc.stationName;
	delete doc._id;
	delete doc.executionTime;
	delete doc.id;
	delete doc.availableBikes;
	delete doc.availableDocks;
	delete doc.totalDocks;
}

function closeAndWrite(data) {
	fs.writeFile("data/sorted_data.json", JSON.stringify(data, null, 2), function(err) {
		if (err) throw err;
		console.log('Completed!');
		db.close();
	});
}