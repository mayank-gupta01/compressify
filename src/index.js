require("dotenv").config({ path: "" });
const express = require("express");
const { connectDB } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Err: " + error);
      throw error;
    });
    app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
  })
  .catch((error) => {
    console.log(error);
  });
