const errorHandler = (err, req, res, next) => {
  console.error(err);

  res.status(err?.status || 500);
  res.render("error", {
    title: "Error",
    error: err?.message || "An unexpected error occurred.",
    user: req.user,
  });
};

module.exports = errorHandler;
