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

app.get("/manuscripts", (request, response) => {
  let manuscripts = mongoUtil.manuscripts();
  manuscripts.find().toArray((err, docs) => {
    //console.log(JSON.stringify(docs));
    //let wordNames = docs.map((word) => word);
    response.json ( docs );
  });
  //{"name": "dog", "frequency": 5, "isWord": true} , {"name": "caht", "frequency": 7, "isWord": false}
});

//8181 is arbitrary
app.listen(8181, () => console.log( "listening on 8181 yay!"));
