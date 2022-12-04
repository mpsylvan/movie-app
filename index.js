const express = require("express"),
  path = require("path"),
  morgan = require("morgan"),
  fs = require("fs");
const app = express();
const port = 5000;
let top10 = [
  {
    name: "Knives Out",
    director: "Rian Johnson",
    releaseYear: 2019,
    studio: "Lionsgate",
    country: "us",
  },
  {
    name: "Lola Rennt",
    director: "Tom Twyker",
    releaseYear: 1998,
    studio: "Prokino Filmverleih",
    country: "de",
  },
  {
    name: "Lola Rennt",
    director: "Tom Twyker",
    releaseYear: 1998,
    studio: "Prokino Filmverleih",
    country: "de",
  },
  {
    name: "In Bruges",
    director: "Martin McDonagh",
    releaseYear: 2008,
    studio: ["Focus Features", "Universal"],
    country: ["uk", "us"],
  },
  {
    name: "Godfather",
    director: "Francis Coppola",
    releaseYear: 1978,
    studio: "MGM",
    country: "us",
  },
  {
    name: "The Green Knight",
    director: "David Lowery",
    releaseYear: 2021,
    studio: "A24",
    country: "us",
  },
  {
    name: "Lola Rennt",
    director: "Tom Twyker",
    releaseYear: 1998,
    studio: "Prokino Filmverleih",
    country: "de",
  },
  {
    name: "Lola Rennt",
    director: "Tom Twyker",
    releaseYear: 1998,
    studio: "Prokino Filmverleih",
    country: "de",
  },
  {
    name: "Lola Rennt",
    director: "Tom Twyker",
    releaseYear: 1998,
    studio: "Prokino Filmverleih",
    country: "de",
  },
  {
    name: "Lola Rennt",
    director: "Tom Twyker",
    releaseYear: 1998,
    studio: "Prokino Filmverleih",
    country: "de",
  },
];

// creates a write stream for morgan to log each request to the server in logs file.
let logStream = fs.createWriteStream(path.join(__dirname, "logs.txt"), {
  flags: "a",
});

// middleware
app.use(morgan("common", { stream: logStream }));
app.use(express.static("public"));

//error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/", (req, res) => {
  res.send(`<h3> Welcome to the movie api </h3>`);
});

app.get("/documentation.html", (req, res) => {
  res.sendFile(path.join(__dirname, "documentation.html"));
});

app.get("/movies", (req, res) => {
  res.json(top10);
});

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
