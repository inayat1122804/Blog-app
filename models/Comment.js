const { Template } = require("ejs");
const mongoose = require("mongoose");
const { type } = require("node:os");

//!========== User Schema ===========>
const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    post: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    author: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
