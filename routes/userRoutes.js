const express = require("express");
const userRoutes = express.Router();
const User = require("../models/User");
const upload = require("../config/multer");

const {
  logout,
  getHome,
  getLogin,
  login,
  register,
  getRegister,
} = require("../controllers/authController");
const {
  getUserProfile,
  getEditProfileForm,
  getUpdateProfile,
  deleteUserAccount,
} = require("../controllers/userController");
const { ensureAuthenticated } = require("../middlewares/auth");

//=============== Route =============>
userRoutes.get("/profile", ensureAuthenticated, getUserProfile);

// ============= Edit profile route
userRoutes.get("/edit", ensureAuthenticated, getEditProfileForm);
userRoutes.post(
  "/profile",
  ensureAuthenticated,
  upload.single("profilePicture"),
  getUpdateProfile,
);

// delete Route
userRoutes.post("/delete", ensureAuthenticated, deleteUserAccount);
module.exports = userRoutes;
