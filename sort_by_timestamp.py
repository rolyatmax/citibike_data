### Sort By Timestamp
import json
from pymongo import MongoClient
from bson.json_util import dumps
from underscore import _

client = MongoClient()

db = client.citibike
data_file = open('data/sorted_data.json', 'w+')

### this is returning a <pymongo.cursor.Cursor object at 0x10702ab50>
snapshots = db.bikes.find()

#### maybe that's why this line isn't working....
data = _.groupBy(snapshots, lambda snapshot, *a: snapshot.executionTime)

out = data
json.dump(out, data_file, indent=True)

data_file.close()
