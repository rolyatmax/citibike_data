### Clean Data
import json
from pymongo import MongoClient
from bson.json_util import dumps

client = MongoClient()

db = client.citibike
data_file = open('data/stations.json', 'w+')

# get all the station ids and go through to start building up the stations json doc
ids = db.bikes.distinct('id')

data = []

include_keys = {
	'latitude': True,
	'longitude': True,
	'stationName': True,
	'id': True,
	'_id': False
}

for id in ids:
	station = db.bikes.find_one({ 'id': id }, include_keys)
	data.append(station)

out = data
json.dump(out, data_file, indent=True)

data_file.close()
