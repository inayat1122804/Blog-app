const express = require("express");
const {
  getPostForm,
  createPost,
  getAllPosts,
  getSinglePost,
  getEditPostForm,
  updatePost,
  deletePost,
  getEditCommentForm,
  updateComment,
  deleteComment,
} = require("../controllers/postController");
const upload = require("../config/multer");
const { ensureAuthenticated } = require("../middlewares/auth");
const { getMaxListeners } = require("../models/Post");
const postRoutes = express.Router();

// Get Post Form
postRoutes.get("/", getPostForm);
postRoutes.get("/new", getPostForm);

// Create Post
postRoutes.post("/", ensureAuthenticated, upload.array("image", 5), createPost);

// get all posts
postRoutes.get("/all", getAllPosts);

postRoutes.get("/:id/edit", getEditPostForm);

// update post
postRoutes.put(
  "/:id",
  ensureAuthenticated,
  upload.array("image", 5),
  updatePost,
);
// delete post
postRoutes.delete("/:id", ensureAuthenticated, deletePost);

// comment update form
postRoutes.get(
  "/:postId/comments/:commentId/edit",
  ensureAuthenticated,
  getEditCommentForm,
);

// comment update logic
postRoutes.put(
  "/:postId/comments/:commentId",
  ensureAuthenticated,
  updateComment,
);
// comment delete post
postRoutes.delete(
  "/:postId/comments/:commentId",
  ensureAuthenticated,
  deleteComment,
);
// get single post (must be after /all to avoid matching "all" as an ID)
postRoutes.get("/:id", getSinglePost);

module.exports = postRoutes;
