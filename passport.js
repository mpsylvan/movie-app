const passport = require("passport"); // requiring the main passport package
const LocalStrategy = require("passport-local").Strategy; // class for creating local/HTTP strategies.
const Models = require("./models.js"); // requre the db models configured in models.js
const passportJWT = require("passport-jwt"); // import the web token interface

let Users = Models.User; // acesss db.users through Users variable.
let JWTStrategy = passportJWT.Strategy; // JWT constructor
let ExtractJWT = passportJWT.ExtractJwt; //

// defines basic HTTP auth for logins.
passport.use(
  // passport registers this strategy, THEN it can be employed as middleware
  new LocalStrategy( // configuring the  local strategy
    {
      username: "Username",
      password: "Password",
    },
    // 'verify' function that takes in credentials and a callback
    (username, password, callback) => {
      console.log(username + " " + password);
      Users.findOne({ username: username }, (err, user) => {
        if (err) {
          console.log(err);
          return callback(err); // internal server issue, callback accepts err argument.
        }
        if (!user) {
          console.log("incorrect username");
          //invalidity in the entry, callback takes boolean false
          return callback(null, false, {
            message: "Incorrect username",
          });
        }

        // validate password declared on all instances of User, in models.js
        if (!user.validatePassword(password)) {
          console.log("invalid password");
          return callback(null, false, {
            message: "Invalid password",
          });
        }

        console.log("finished");
        return callback(null, user);
      });
    }
  )
);

passport.use(
  //passport registers this strategy, allowing all restricted routes in index.js to employ it as middleware
  new JWTStrategy( // configuring a JWT strategy
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
