"use strict";

let mongo = require('mongodb');
let client = mongo.MongoClient;
let _db;

module.exports = {
  connect() {
    client.connect('mongodb://localhost:27017/manuscript-dev', (err, db) => {
      if(err) {
        console.log("error connecting to mongo; check mongod connection");
        process.exit(1);
      }
      _db = db;
      console.log("connected to mongo yay!");
    });
  },
  manuscripts() {
    return _db.collection('manuscripts');
  }
}
