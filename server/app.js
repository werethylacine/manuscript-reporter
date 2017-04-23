"use strict";

let express = require("express");
let app = express();

let mongoUtil = require('./mongoUtil');
mongoUtil.connect();

let secrets = require('./secrets');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuthStrategy;

// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Google profile), and
//   invoke a callback with a user object.
passport.use(new GoogleStrategy({
    consumerKey: secrets.googleClientID(),
    consumerSecret: secrets.googleClientSecret(),
    callbackURL: "http://www.example.com/auth/google/callback"
  },
  function(token, tokenSecret, profile, done) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        console.log(consumerKey, consumerSecrets);
        return done(err, user);
      });
  }
));

//where express should look for static files to serve up
app.use( express.static(__dirname + "/../client") );

let bodyParser = require("body-parser");
let jsonParser = bodyParser.json();

//gets all manuscripts to create navigation section
app.get("/manuscripts", (request, response) => {
  let manuscripts = mongoUtil.manuscripts();
  manuscripts.find().toArray((err, docs) => {
    if (err) {
      response.sendStatus(400);
    }
    else {
    response.json ( docs );
    }
  });
});

//new manuscript page redirects back to manuscript main page after submit
app.post("/manuscripts", jsonParser, (request, response) => {
  let new_man_title = request.body.title;
  let new_man_author = request.body.author;
  let new_man_notes = request.body.notes || '';
  //TODO:probably ought to grab creation date in here, also user id

  //guard against lack of title or author
  if(!new_man_title || !new_man_author){
    response.sendStatus(400);
  }

  //put that new manuscript in the collection!
  let manuscripts = mongoUtil.manuscripts();
  manuscripts.insertOne( { title: new_man_title, author: new_man_author, notes: new_man_notes });
  response.sendStatus(201);
});

//gets doc of manuscript details from mongo based on title
app.get("/manuscripts/:title", (request, response) => {
  let manuTitle = request.params.title;
  let manuscripts = mongoUtil.manuscripts();
  //.limit is needed bc find returns a pointer
  manuscripts.find({title: manuTitle}).limit(1).next((err,doc) => {
    if (err) {
      response.sendStatus(400);
    }
    response.json(doc);
  });
});

//8181 is arbitrary
app.listen(8181, () => console.log( "listening on 8181 yay!"));
