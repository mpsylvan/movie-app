const mongoose = require("mongoose"); // requiring the mongoose module into your file.
const bcrypt = require("bcrypt");

let movieSchema = mongoose.Schema({
  // calling the Schema constructor on the mognoose module, and passing in the schema/ template with data types, and requirements.
  Name: { type: String, required: true },
  Director: {
    // director is a sub-document.
    Name: { type: String, required: true },
    Nationality: { type: String, required: true },
    Bio: { type: String, required: true },
  },
  ReleaseYear: { type: Number, required: true },
  Studio: { type: String, required: true },
  Synopsis: { type: String, required: true },
  Country: { type: String, required: true },
  Genre: {
    // genre is a sub-document.
    Name: String,
    Description: String,
  },
  Feature: Boolean,
});
// User schema declaration
let userSchema = mongoose.Schema({
  Email: { type: String, required: true },
  Password: { type: String, required: true },
  Username: { type: String, required: true },
  Birthdate: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

// static method attached to the User schema that hashes the password of each instance of User document.nor
userSchema.statics.hashPassword = (Password) => {
  return bcrypt.hashSync(Password, 10); // the string to be hashed and the salt
};

// instance method compares an inputted password with the User document password field that is in context.
userSchema.methods.validatePassword = function (Password) {
  return bcrypt.compareSync(Password, this.Password);
};

let directorSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Bio: { type: String, required: true },
  Nationality: String,
  DateOfBirth: { type: Date, required: true },
});

let genreSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Description: String,
});

// create create the models, passing in the model name (this gets pluralized and lowercased), and the schema that that model will follow.
let Movie = mongoose.model("Movie", movieSchema); //this will generate as db.movies
let User = mongoose.model("User", userSchema); // this will generate as db.users
let Director = mongoose.model("Director", directorSchema); // generate as db.directors
let Genre = mongoose.model("Genre", genreSchema); // generate as db.genres

module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Director = Director;
module.exports.Genre = Genre;
