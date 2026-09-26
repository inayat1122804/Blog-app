const expressAsyncHandler = require("express-async-handler");
const User = require("../models/User");
const Post = require("../models/Post");
const File = require("../models/File");
const cloudinary = require("../config/cloudinary");
const Comment = require("../models/Comment");

// get user profile
exports.getUserProfile = expressAsyncHandler(async (req, res) => {
  // find the user
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.render("login", {
      title: "Login",
      error: "User not found",
      user: req.user,
    });
  }

  // find the user's posts
  const posts = await Post.find({ author: req.user._id }).sort({
    createdAt: -1,
  });

  res.render("profile", {
    title: "Profile",
    user,
    posts,
    error: "",
    postCount: posts.length,
  });
});

// get edit profile form
exports.getEditProfileForm = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return res.render("login", {
      title: "login",
      user: req.user,
      error: "User Not found",
    });
  }
  res.render("editProfile", {
    title: "Edit Profile",
    user,
    error: "",
  });
});

// update profile
exports.getUpdateProfile = expressAsyncHandler(async (req, res) => {
  const { username, email, bio } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.render("login", {
      title: "Login",
      user: req.user,
      error: "User Not Found",
    });
  }

  // Update fields
  user.username = username || user.username;
  user.email = email || user.email;
  user.bio = bio || user.bio;

  // If new image uploaded
  if (req.file) {
    // Delete old image from cloudinary
    if (user.profilePicture && user.profilePicture.public_id) {
      await cloudinary.uploader.destroy(user.profilePicture.public_id);
    }
    // Save new image
    const file = await File.create({
      url: req.file.path,
      public_id: req.file.filename,
      uploaded_by: req.user._id,
    });

    // Update user profile picture
    user.profilePicture = {
      url: file.url,
      public_id: file.public_id,
    };
  }
  // Save user
  await user.save();
  res.render("editProfile", {
    title: "Edit Profile",
    user,
    error: "",
    success: "Profile updated successfully",
  });
});

// delete user Account
exports.deleteUserAccount = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.render("login", {
      title: "Login",
      user: req.user,
      error: "",
    });
  }
  if (user.profilePicture && user.profilePicture.public_id) {
    await cloudinary.uploader.destroy(user.profilePicture.public_id);
  }
  // delete all posts created by user
  const posts = await Post.find({ author: req.user._id });
  for (const post of posts) {
    for (const image of post.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(post._id);
  }
  // delete the all comments make by the user
  await Comment.deleteMany({ author: req.user._id });

  // Delete all files
  const files = await File.find({ uploaded_by: req.user._id });
  for (const file of files) {
    await cloudinary.uploader.destroy(file.public_id);
  }
  // delete user
  await User.findByIdAndDelete(req.user._id);
  res.redirect("/register");
});
