const mongoose = require("mongoose");

const product = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    inputImgUrls: {
      type: [String],
    },
    processedImgUrl: {
      type: [String],
    },
    status: {
      type: String,
      enum: ["IN PROCESS", "SUCCESS"],
      default: "IN PROCESS",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = product;
