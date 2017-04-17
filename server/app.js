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
