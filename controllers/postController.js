const asyncHandler = require("express-async-handler");
const Post = require("../models/Post");
const File = require("../models/File");
const cloudinary = require("../config/cloudinary");
const Comment = require("../models/Comment");

// Get post form
exports.getPostForm = asyncHandler((req, res) => {
  res.render("newPost", {
    title: "Create New Post",
    user: req.user,
    error: "",
    success: req.query.success || "",
  });
});

// Create post
exports.createPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  // Check login
  if (!req.user) {
    return res.redirect("/login");
  }

  // Validate input
  if (!title || !content) {
    throw new Error("Title and content are required");
  }

  // Check images
  if (!req.files || req.files.length === 0) {
    throw new Error("Please upload at least one image");
  }

  // Save images
  const images = await Promise.all(
    req.files.map(async (file) => {
      const newFile = new File({
        url: file.path,
        public_id: file.filename,
        uploaded_by: req.user._id,
      });

      await newFile.save();

      return {
        url: newFile.url,
        public_id: newFile.public_id,
      };
    }),
  );

  // Create post
  const newPost = new Post({
    title,
    content,
    author: req.user._id,
    images,
  });

  await newPost.save();

  res.redirect("/posts/all?success=Post created successfully");
});

// Get all posts
exports.getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .populate("author", "username")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        model: "User",
        select: "username",
      },
    });
  res.render("allPosts", {
    title: "All Posts",
    user: req.user,
    success: req.query.success || "",
    error: "",
    posts,
  });
});

// single post
exports.getSinglePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          model: "User",
          select: "username",
        },
      });

    if (!post) {
      return res.send("Post not found");
    }

    res.render("singlePost", { post, title: post.title, user: req.user });
  } catch (err) {
    console.log(err);
    res.send("Error loading post");
  }
};

// update post form
exports.getEditPostForm = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.render("allPosts", {
      title: "All Posts",
      user: req.user,
      success: "",
      error: "Post not found",
      posts,
    });
  }
  res.render("editPost", {
    title: "Edit Post",
    user: req.user,
    error: "",
    success: "",
    post,
  });
});

// update post logic
exports.updatePost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.render("allPosts", {
      title: "All Posts",
      user: req.user,
      success: "",
      error: "Post not found",
      posts,
    });
  }
  // Check if the logged-in user is the author of the post
  if (post.author.toString() !== req.user._id.toString()) {
    return res.render("allPosts", {
      title: "All Posts",
      user: req.user,
      success: "",
      error: "You are not authorized to edit this post",
      posts,
    });
  }

  // Validate input
  post.title = title || post.title;
  post.content = content || post.content;
  if (req.files && req.files.length > 0) {
    post.images = await Promise.all(
      req.files.map(async (file) => {
        const newFile = new File({
          url: file.path,
          public_id: file.filename,
          uploaded_by: req.user._id,
        });
        await newFile.save();
        return {
          url: newFile.url,
          public_id: newFile.public_id,
        };
      }),
    );
    await post.save();
    res.redirect(`/posts/${post._id}?success=Post updated successfully`);
  }
});

// delete post logic
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.render("allPosts", {
      title: "All Posts",
      user: req.user,
      success: "",
      error: "Post not found",
      posts,
    });
  }
  if (post.author.toString() !== req.user._id.toString()) {
    return res.render("allPosts", {
      title: "All Posts",
      user: req.user,
      success: "",
      error: "You are not authorized to delete this post",
      posts,
    });
  }
  await Promise.all(
    post.images.map(async (image) => {
      await cloudinary.uploader.destroy(image.public_id);
    }),
  );
  await Post.findByIdAndDelete(req.params.id);
  res.redirect("/posts/all?success=Post deleted successfully");
});

// comment update form
exports.getEditCommentForm = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId).populate("post");
  if (!comment) {
    return res.redirect("/posts/all");
  }
  res.render("editComment", {
    title: "Edit Comment",
    user: req.user,
    error: "",
    success: "",
    comment,
    post: comment.post,
  });
});

// comment update logic
exports.updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) {
    return res.redirect("singlePost", {
      title: "Single Post",
      user: req.user,
      error: "Comment not found",
      success: "",
      comment,
    });
  }
  if (comment.author.toString() !== req.user._id.toString()) {
    return res.redirect("singlePost", {
      title: "Single Post",
      user: req.user,
      error: "You are not authorized to edit this comment",
      success: "",
      comment,
    });
  }
  comment.content = content || comment.content;
  await comment.save();
  res.redirect(`/posts/${comment.post}?success=Comment updated successfully`);
});

// comment delete logic
exports.deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) {
    return res.redirect("/posts/all?error=Comment not found");
  }
  if (comment.author.toString() !== req.user._id.toString()) {
    return res.redirect(`/posts/${comment.post}?error=Not authorized`);
  }
  await Comment.findByIdAndDelete(req.params.commentId);
  res.redirect(`/posts/${comment.post}?success=Comment deleted successfully`);
});
