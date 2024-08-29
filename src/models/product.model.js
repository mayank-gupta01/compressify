const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
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
      enum: ["PROCESSING", "SUCCESS"],
      default: "PROCESSING",
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
