"use strict";

let express = require("express");
let app = express();

let ObjectId = require("mongodb").ObjectID;
let mongoUtil = require('./mongoUtil');
mongoUtil.connect();

let secrets = require('./secrets');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuthStrategy;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(new GoogleStrategy({
  consumerKey: secrets.googleClientID(),
  consumerSecret: secrets.googleClientSecret(),
  returnURL: 'http://localhost:8181/auth/google/return',
  realm: 'http://localhost:8181/'
  },
  function(identifier, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions
app.use(passport.initialize());
app.use(passport.session());

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
      //console.log("Manuscripts being sent back from mongoUtil: ", docs);
      response.json ( docs );
    }
  });
});

//new manuscript page redirects back to manuscript main page after submit
app.post("/manuscripts", jsonParser, (request, response) => {
  let new_man_title = request.body.title;
  let new_man_author = request.body.author;
  let new_man_notes = request.body.notes || 'N/A';
  let new_man_length = request.body.length;
  let new_man_contents = request.body.contents;
  let date = new Date();
  let new_man_creation_date = date.toDateString();
  //TODO:probably ought to grab creation date in here, also user id

  //guard against lack of title or author
  if(!new_man_title || !new_man_author){
    response.sendStatus(400);
  }

  //put that new manuscript in the collection! This settimeout is an attempt to deal with
  //the api requests that need to finish :(
  setTimeout(function(){
    let manuscripts = mongoUtil.manuscripts();
    manuscripts.insertOne( { title: new_man_title,
                            author: new_man_author,
                            notes: new_man_notes,
                            length: new_man_length,
                            contents: new_man_contents,
                            date: new_man_creation_date });
    response.sendStatus(201);
  }, 1000);
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

//deletes manuscripts from the collection
app.delete("/manuscripts/:manu_id/removeManu", jsonParser, (request, response) => {

  let id = { _id: ObjectId(request.params.manu_id)};
  let manuscripts = mongoUtil.manuscripts();
  manuscripts.remove(id, function(err, records){
        if(err){
            console.log("Error" + err);
            response.sendStatus(402);
        }
        else{
            console.log("The manuscript with id: " + request.params.manu_id + " has been removed!");
            response.sendStatus(202);
        }
    });
});

app.get('/login', function(req, res){
  req.user = "Judy Blume";
  res.json({ path: '/login', user: req.user });
});

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve redirecting
//   the user to google.com.  After authenticating, Google will redirect the
//   user back to this application at /auth/google/return
app.get('/auth/google',
  passport.authenticate('google', { scope: 'email', failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

// GET /auth/google/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/return',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

//8181 is arbitrary
app.listen(8181, () => console.log( "listening on 8181 yay!"));
