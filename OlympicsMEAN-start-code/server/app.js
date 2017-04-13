"use strict";

let express = require("express");
let app = express();

let mongoUtil = require('./mongoUtil');
mongoUtil.connect();

//where express should look for static files to serve up
app.use( express.static(__dirname + "/../client") );

app.get("/words", (request, response) => {
  let words = mongoUtil.words();
  words.find().toArray((err, docs) => {
    console.log(JSON.stringify(docs));
    //let wordNames = docs.map((word) => word);
    response.json ( docs );
  });
  //{"name": "dog", "frequency": 5, "isWord": true} , {"name": "caht", "frequency": 7, "isWord": false}
});

//8181 is arbitrary
app.listen(8181, () => console.log( "listening on 8181 yay!"));
