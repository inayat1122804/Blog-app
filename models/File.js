const { Template } = require("ejs");
const mongoose = require("mongoose");
const { type } = require("node:os");

//!========== User Schema ===========>
const fileSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
    uploaded_by: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timeseries: true,
  },
);

const File = mongoose.model("File", fileSchema);
module.exports = File;
