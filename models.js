const mongoose = require("mongoose"); // requiring the mongoose module into your file.
const bcrypt = require("bcrypt");

let movieSchema = mongoose.Schema({
  // calling the Schema constructor on the mognoose module, and passing in the schema/ template with data types, and requirements.
  name: { type: String, required: true },
  director: {
    // director is a sub-document.
    name: { type: String, required: true },
    nationality: { type: String, required: true },
    bio: { type: String, required: true },
  },
  releaseYear: { type: Number, required: true },
  studio: { type: String, required: true },
  synopsis: { type: String, required: true },
  country: { type: String, required: true },
  genre: {
    // genre is a sub-document.
    name: String,
    description: String,
  },
  feature: Boolean,
});
// User schema declaration
let userSchema = mongoose.Schema({
  name: String,
  email: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  birthdate: Date,
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

// static method attached to the User schema that hashes the password of each instance of User document.
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10); // the string to be hashed and the salt
};

// instance method compares an inputted password with the User document password field that is in context.
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

let directorSchema = mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String, required: true },
  nationality: String,
  dateOfBirth: { type: Date, required: true },
});

let genreSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: String,
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
