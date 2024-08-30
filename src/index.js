require("dotenv").config({ path: "" });
const express = require("express");
const { connectDB } = require("./db");
const processTask = require("./utils/processTask");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Import Routes
const productRouter = require("./routes/product.routes");

//Routes Declaration
app.use("/api/v1/product", productRouter);

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Err: " + error);
      throw error;
    });
    app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
    setInterval(processTask, 1000); //call processTask at every second and fetch the process.
  })
  .catch((error) => {
    console.log(error);
  });
