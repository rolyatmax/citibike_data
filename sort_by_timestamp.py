### Sort By Timestamp
import json
from pymongo import MongoClient
from bson.json_util import dumps

client = MongoClient()

db = client.citibike
data_file = open('data/sorted_data.json', 'w+')

data = []


out = data
json.dump(out, data_file, indent=True)

data_file.close()
