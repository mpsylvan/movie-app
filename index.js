const express = require("express"),
  path = require("path"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  fs = require("fs");

const app = express();
const port = 5000;

// 'in memory data' to test the request handlers
let top10 = [
  {
    name: "Knives Out",
    director: "Rian Johnson",
    releaseYear: 2019,
    studio: "Lionsgate",
    country: "us",
    genre: ["mystery", "comedy"],
  },
  {
    name: "Lola Rennt",
    director: "Tom Twyker",
    releaseYear: 1998,
    studio: "Prokino Filmverleih",
    country: "de",
    genre: ["sci-fi"],
  },

  {
    name: "In Bruges",
    director: "Martin McDonagh",
    releaseYear: 2008,
    studio: ["Focus Features", "Universal"],
    country: ["uk", "us"],
    genre: ["comedy", "dark-comedy"],
  },
  {
    name: "Godfather",
    director: "Francis Coppola",
    releaseYear: 1978,
    studio: "MGM",
    country: "us",
    genre: ["drama"],
  },
  {
    name: "The Green Knight",
    director: "David Lowery",
    releaseYear: 2021,
    studio: "A24",
    country: "us",
    genre: ["fantasy", "historical", "drama"],
  },
  {
    name: "The Batman",
    director: "Matt Reeves",
    releaseYear: 2022,
    studio: "Warner Bros",
    country: "us",
    genre: ["superhero", "crime"],
  },
];

let genres = [];
top10.forEach((movie) => {
  movie.genre.forEach((genre) => genres.push(genre));
});

// creates a write stream for morgan to log each request to the server in logs file.
let logStream = fs.createWriteStream(path.join(__dirname, "logs.txt"), {
  flags: "a",
});

// middleware
app.use(morgan("common", { stream: logStream }));
app.use(express.static("public"));
app.use(bodyParser.json());

//error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broken in application");
});

// API Endpoints and request handlers
app.get("/movies", (req, res) => {
  res.status(200).json(top10);
});
// get data about a specific movie
app.get("/movies/:title", (req, res) => {
  let title = req.params.title;
  res.status(200).json(top10.find((movie) => movie.name === title));
});
//get a list of all directors
app.get("/directors", (req, res) => {
  res.status(200).send(top10.map((movie) => movie.director));
});
// get data about a specific director
app.get("/directors/:name", (req, res) => {
  let directors = top10.map((movie) => movie.director);
  res
    .status(200)
    .json(directors.filter((director) => director === req.params.name));
});
// get all genres
app.get("/genres", (req, res) => {
  res.status(200).json(genres);
});
// get movies with a specific genre type
app.get("/genres/:type", (req, res) => {
  res
    .status(200)
    .send(top10.filter((movie) => movie.genre.includes(req.params.type)));
});

app.get("/documentation.html", (req, res) => {
  res.sendFile(path.join(__dirname, "documentation.html"));
});
// add new user
app.post("/users", (req, res) => {
  let newAccount = req.body;
  console.log(newAccount);
  if (!newAccount.name) {
    res.status(400).json({ message: "error, request must have name variable" });
  } else {
    res
      .status(201)
      .json({ message: "successfully added new account", data: newAccount });
  }
});
// update a username
app.put("/users/:username", (req, res) => {
  let username = req.params.username;
  let data = req.body;
  if (!data.newUsername) {
    res.status(404).send("A new username was not submitted");
  } else {
    res
      .status(200)
      .send(`Username changed from ${username} to ${data.newUsername}`);
  }
});
// add new movie to user's favorites list.
app.post("/users/:username/favorites/:movie", (req, res) => {
  let newMovie = req.params.movie;
  let user = req.params.username;
  res
    .status(200)
    .send(`${newMovie} successfully added to ${user}'s favorites.`);
});

// delete a movie from favorites list.
app.delete("/users/:username/favorites/:movie", (req, res) => {
  let deleteMovie = req.params.movie;
  let user = req.params.username;
  res
    .status(200)
    .send(`${deleteMovie} successfully deleted from ${user}'s favorites.`);
});

// delete user's account
app.delete("/users/:username", (req, res) => {
  res
    .status(200)
    .send(`${req.params.username}'s account successfully deleted. `);
});

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
