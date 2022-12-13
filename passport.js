const passport = require("passport"); // requiring the main passport package
const LocalStrategy = require("passport-local").Strategy; // class for creating local/HTTP strategies.
const Models = require("./models.js"); // requre the db models configured in models.js
const passportJWT = require("passport-jwt"); // import the web token interface

let Users = Models.User; // acesss db.users through Users variable.
let JWTStrategy = passportJWT.Strategy; // JWT constructor
let ExtractJWT = passportJWT.ExtractJwt; //

// defines basic HTTP auth for logins.
passport.use(
  new LocalStrategy(
    {
      username: "Username",
      password: "Password",
    },
    (username, password, callback) => {
      console.log(username + " " + password);
      Users.findOne({ username: username }, (err, user) => {
        if (err) {
          console.log(err);
          return callback(err);
        }
        if (!user) {
          console.log("incorrect username");
          return callback(null, false, {
            message: "Incorrect username or password",
          });
        }

        console.log("finished");
        return callback(null, user);
      });
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "your_jwt_secret",
    },
    (jwtPayload, callback) => {
      return Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
