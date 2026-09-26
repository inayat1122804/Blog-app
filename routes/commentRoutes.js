const express = require("express");
const commentRoutes = express.Router();
const { addComment } = require("../controllers/commentControllers");
const { ensureAuthenticated } = require("../middlewares/auth");

// Route to add a comment to a post
commentRoutes.post("/posts/:id/comments", ensureAuthenticated, addComment);

module.exports = commentRoutes;
