const redis = require("./client");

const Product = require("../models/product.model");

const processTask = async () => {
  try {
    const value = await redis.lpop("task");

    if (value) {
      const valueObj = JSON.parse(value);
      const fileId = valueObj.id;
      const filePath = valueObj.csvFilePath;

      //validate the csv file
      await validateCSV(fileId, filePath);

      //compress images via clodinary
      const allProducts = await Product.find();
    }
  } catch (error) {
    console.error("error:", error);
  }
};

module.exports = { processTask };
