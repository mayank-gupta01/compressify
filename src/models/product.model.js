const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    productName: {
      type: String,
      lowercase: true,
      trim: true,
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },
    inputImgUrls: {
      type: [String],
    },
    processedImgUrls: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
