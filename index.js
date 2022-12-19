const express = require("express"),
  path = require("path"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  fs = require("fs"),
  cors = require("cors");

const { check, validationResult } = require("express-validator");

const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;
const Directors = Models.Director;
const Genres = Models.Genre;

const app = express();
const port = process.env.PORT || 8080;

// mongoose.connect("mongodb://localhost:27017/SceneStealer", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// creates a write stream for morgan to log each request to the server in logs file.
let logStream = fs.createWriteStream(path.join(__dirname, "logs.txt"), {
  flags: "a",
});
// implement cors before authorization/authentication
// let allowedDomains = [`http://localhost8080/`];
app.use(cors());

// passport strategies and /login JWT generation
let auth = require("./auth.js")(app);
const passport = require("passport");
require("./passport");

// route middleware
app.use(morgan("common", { stream: logStream }));
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broken in application");
});

// ******* API Endpoints and request handlers *******

//documentation page
app.get("/documentation.html", (req, res) => {
  res.sendFile(path.join(__dirname, "documentation.html"));
});

// home page
app.get("/", (req, res) => {
  res.send("Welcome to the SceneStealer Database!");
});

// get all movies
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send(`Error: ${error}`);
      });
  }
);

// get single movie
app.get(
  "/movies/:name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ name: req.params.name })
      .then((movie) => {
        if (!movie) {
          res.status(400).send(`no movie named ${req.params.name}`);
        } else {
          res.status(200).json(movie);
        }
      })
      .catch((err) => {
        res.status(404).send("error: " + err);
      });
  }
);
// list all genres
app.get(
  "/genres",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Genres.find()
      .then((genres) => res.status(200).json(genres))
      .catch((err) => res.status(500).send("Error:" + err));
  }
);
// get single genre data
app.get(
  "/genres/:genre",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "genre.name": req.params.genre }).then((movie) => {
      if (!movie) {
        res.status(404).send("genre not found");
      } else {
        res.status(201).json(movie.genre);
      }
    });
  }
);
//get all directors
app.get(
  "/directors",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Directors.find()
      .then((directors) => res.status(200).json(directors))
      .catch((err) => res.status(500).send("Error: " + err));
  }
);
// get single director data
app.get(
  "/directors/:name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "director.name": req.params.name })
      .then((match) => {
        if (!match) {
          res.status(404).send(`Director named ${req.params.name} not found.`);
        } else {
          res.status(201).json(match.director);
        }
      })
      .catch((err) => res.status(500).send(`error: ${err}`));
  }
);

// add new user
app.post(
  "/users",
  [
    check("username", "username is required").isLength({ min: 5 }),
    check(
      "username",
      "username can only be made of letters and numbers"
    ).isAlphanumeric(),
    check("password", "password is required").not().isEmpty(),
    check("email", "valid email is required").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password); //  hashed form of password field of req body, static method declared in models.js
    Users.findOne({ username: req.body.username })
      .then((user) => {
        if (user) {
          res.status(400).send(`'${req.body.username}' already exists.`);
        } else {
          Users.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword, //  stores the hashed form
            username: req.body.username,
            birthdate: req.body.birthdate,
          })
            .then((user) => {
              res.status(201).json({
                message: "Account successfully created",
                user: user,
              });
            })
            .catch((error) => {
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        res.status(500).send("Error: " + error);
      });
  }
);

// delete a user
app.delete(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ username: req.params.username })
      .then((user) => {
        if (!user) {
          res.status(400).send(`${req.params.username} was not found.`);
        } else {
          res.status(200).send(`${req.params.username} has been removed.`);
        }
      })
      .catch((err) => {
        res.status(500).send("error: " + err);
      });
  }
);

// update a users data
app.put(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  [
    check("username", "username is required").isLength({ min: 5 }),
    check(
      "username",
      "username can only be made of letters and numbers"
    ).isAlphanumeric(),
    check("password", "password is required").not().isEmpty(),
    check("email", "valid email is required").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          birthdate: req.body.birthdate,
        },
      },
      { new: true },
      (err, newUser) => {
        if (err) {
          res.status(500).send("Error " + err);
        }
        if (!newUser) {
          res
            .status(401)
            .send(
              `${req.params.username} not found, make sure username entered correctly.`
            );
        } else {
          res.status(201).json({
            message: "User Updated Sucessfully",
            newUser: newUser,
          });
        }
      }
    );
  }
);

// add new movie to user's favorites list.
app.post(
  "/users/:username/favorites/:movieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { username: req.params.username },
      { $addToSet: { favoriteMovies: req.params.movieID } },
      { new: true }
    )
      .then((updatedUser) =>
        res.status(201).send(`${updatedUser.username}'s favorites updated.`)
      )
      .catch((err) => res.status(500).send("error:" + err));
  }
);

app.get("/directors", (req, res) => {
  Directors.find()
    .then((directors) => res.status(200).json(directors))
    .catch((err) => res.status(500).send("error: " + err));
});

// remove a movie from favorites list.
app.put(
  "/users/:username/favorites/:movieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { username: req.params.username },
      { $pull: { favoriteMovies: req.params.movieID } },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          res.status(500).send("error" + err);
        } else {
          res
            .status(200)
            .send(`Movie deleted from ${req.params.username}'s favorites.`);
        }
      }
    );
  }
);

app.listen(port, "0.0.0.0", () => {
  console.log(`listening on ${port}`);
});
