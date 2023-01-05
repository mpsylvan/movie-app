const jwtSecret = "your_jwt_secret";

const jwt = require("jsonwebtoken");
const passport = require("passport");

require("./passport"); // local passport file

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: "7d",
    algorithm: "HS256",
  });
};

module.exports = (router) => {
  router.post("/login", (req, res) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: "login issue detection, server could not process the requst",
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.status(200).json({ user, token }); // ES6 shortand for key/value sameness
      });
    })(req, res);
  });
};
