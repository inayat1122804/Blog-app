const expressAsyncHandler = require("express-async-handler");
const Post = require("../models/Post");
const { authorize } = require("passport");
const Comment = require("../models/Comment");
// Adding Comment Controller
exports.addComment = expressAsyncHandler(async (req, res) => {
  const { content } = req.body;
  const postId = req.params.id;
  //   find the post by id
  const post = await Post.findById(postId);
  // validatd if post exist
  if (!post) {
    return res.render("singlePost", {
      title: "Post",
      post,
      user: req.user,
      error: "Post not found",
      success: "",
    });
  }
  if (!content) {
    return res.render("singlePost", {
      title: "Post",
      post,
      user: req.user,
      error: "Comment content is required",
      success: "",
    });
  }
  //   add the comment to the post
  const comment = new Comment({
    content,
    post: postId,
    author: req.user._id,
  });
  post.comments.push(comment._id);

  await comment.save();
  await post.save();
  // redirect to the post page
  res.redirect(`/posts/${postId}`);
});
