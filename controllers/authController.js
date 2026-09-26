const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/User");

exports.getHome = (req, res) => {
  res.render("home", {
    title: "Home",
    user: req.user,
    error: req.query.error || "",
    success: req.query.success || "",
  });
};

exports.getLogin = (req, res) => {
  res.render("login", {
    title: "Login",
    user: req.user,
    error: req.query.error || "",
  });
};

exports.getRegister = (req, res) => {
  res.render("register", {
    title: "Register",
    user: req.user,
    error: req.query.error || "",
    success: req.query.success || "",
  });
};

exports.login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect(
        `/login?error=${encodeURIComponent(info?.message || "Login failed")}`,
      );
    }
    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      return res.redirect("/user/profile");
    });
  })(req, res, next);
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, password2 } = req.body;
    if (!username || !email || !password || !password2) {
      return res.redirect(
        `/register?error=${encodeURIComponent("Please fill all fields")}`,
      );
    }
    if (password !== password2) {
      return res.redirect(
        `/register?error=${encodeURIComponent("Passwords do not match")}`,
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.redirect(
        `/register?error=${encodeURIComponent("Email is already registered")}`,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.redirect(
      `/login?success=${encodeURIComponent("Registration successful. Please login.")}`,
    );
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login?success=Logged out successfully");
  });
};
