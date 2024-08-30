const mongoose = require("mongoose");

const fileSchema = mongoose.Schema(
  {
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

const File = mongoose.model("File", fileSchema);
module.exports = File;
