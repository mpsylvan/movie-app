const express = require("express"),
  path = require("path"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  fs = require("fs");

const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;
const Directors = Models.Director;
const Genres = Models.Genre;

mongoose.connect("mongodb://localhost:27017/SceneStealer", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
const port = 5000;

// creates a write stream for morgan to log each request to the server in logs file.
let logStream = fs.createWriteStream(path.join(__dirname, "logs.txt"), {
  flags: "a",
});

// middleware used in  handlers
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
app.get("/movies", (req, res) => {
  Movies.find().then((movies) => {
    res.status(200).json(movies);
  });
});

// get single movie
app.get("/movies/:name", (req, res) => {
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
});
// list all genres
app.get("/genres", (req, res) => {
  Genres.find()
    .then((genres) => res.status(200).json(genres))
    .catch((err) => res.status(500).send("Error:" + err));
});
// get single genre data
app.get("/genres/:genre", (req, res) => {
  Movies.findOne({ "genre.name": req.params.genre }).then((movie) => {
    if (!movie) {
      res.status(404).send("genre not found");
    } else {
      res.status(201).json(movie.genre);
    }
  });
});
//get all directors
app.get("/directors", (req, res) => {
  Directors.find()
    .then((directors) => res.status(200).json(directors))
    .catch((err) => res.status(500).send("Error: " + err));
});
// get single director data
app.get("/directors/:name", (req, res) => {
  Movies.findOne({ "director.name": req.params.name })
    .then((match) => {
      if (!match) {
        res.status(404).send(`Director named ${req.params.name} not found.`);
      } else {
        res.status(201).json(match.director);
      }
    })
    .catch((err) => res.status(500).send(`error: ${err}`));
});

// add new user
app.post("/users", (req, res) => {
  Users.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        res.status(400).send(`'${req.body.username}' alread exists.`);
      } else {
        Users.create({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
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
});

// delete a user
app.delete("/users/:username", (req, res) => {
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
});

// update a users data
app.put("/users/:username", (req, res) => {
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
});

// add new movie to user's favorites list.
app.post("/users/:username/favorites/:movieID", (req, res) => {
  Users.findOneAndUpdate(
    { username: req.params.username },
    { $addToSet: { favoriteMovies: req.params.movieID } },
    { new: true }
  )
    .then((updatedUser) =>
      res.status(201).send(`${updatedUser.username}'s favorites updated.`)
    )
    .catch((err) => res.status(500).send("error:" + err));
});

app.get("", (req, res) => {
  Directors.find()
    .then((directors) => res.status(200).json(directors))
    .catch((err) => res.status(500).send("error: " + err));
});

// remove a movie from favorites list.
app.put("/users/:username/favorites/:movieID", (req, res) => {
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
});

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
