const express = require("express");
const authRoutes = express.Router();
const User = require("../models/User");
const {
  logout,
  getHome,
  getLogin,
  login,
  register,
  getRegister,
} = require("../controllers/authController");

//=============== Route =============>
authRoutes.get("/", getHome);

authRoutes.get("/login", getLogin);

//======== Login Logic ==========>
authRoutes.post("/login", login);

//======== Registration page route==============>
authRoutes.get("/register", getRegister);

// ======= Registration Logic route ==========>
authRoutes.post("/register", register);

// ======= Registration Logic end ==========>

// =========== Logout Logic ==========>
authRoutes.get("/logout", logout);

module.exports = authRoutes;
