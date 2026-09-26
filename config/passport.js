const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { trace } = require("../routes/authRoutes");

module.exports = function (passport) {
  // Local Strategy
  passport.use(
    new localStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          // find the user by email
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: "User not found" });
          }
          // compare the password
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: "Incorrect password" });
          }
          // if everything is ok, return the user
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );
  //   Serialize user
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });
  //   Deserialize user
  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
