var mongo = require('mongodb');
var Users = {
  findOrCreate(args, cb) {

    var collection = mongoUtil.collection('users');
    var query = {github_id: args.id};
    var newUser = {
      //will skip creating a new user if user already found
      $setOnInsert: {
        github_id: args.id,
        name: args.displayName || args.username
      }
    }

    var options = {
      upsert: true,
      returnOriginal: false
    }

    collection.findOneAndUpdate(query, newUser, options, function(error, res) {
      cb(err, res.value._id);
    });
  }
}
module.exports = Users;
