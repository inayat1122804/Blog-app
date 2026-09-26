require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const methodOverride = require("method-override");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const passportConfig = require("./config/passport");
const postRoutes = require("./routes/postRoutes");
const errorHandler = require("./middlewares/errorHandler");
const commentRoutes = require("./routes/commentRoutes");
const userRoutes = require("./routes/userRoutes");

// =========== Middleware =========>
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== Session Middleware ===========>
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  }),
);

// ========== Method Override Middleware ===========>
app.use(methodOverride("_method"));
// =========== Passport ===========>
passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());

// ========== PORT ====================>
const PORT = process.env.PORT || 3000;
app.set("view engine", "ejs");

// =========== Routes ===============>
app.use("/", authRoutes);
app.use("/posts", postRoutes);
app.use("/", commentRoutes);
app.use("/user", userRoutes);

// ========== Error Handling Middleware ===========>
app.use(errorHandler);
// ============== DB connection ==========>
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    console.log("DataBase has been connected");
  })
  .catch((e) => {
    console.log(e);
  });
