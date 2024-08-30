const redis = require("./client");
const fs = require("fs");
const axios = require("axios");
const csv = require("csv-parser");
const Product = require("../models/product.model");

async function validateCSV(fileId, filePath) {
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", async (row) => {
      const rowNumber = results.length + 1;
      const productName = row["Product Name"];
      const imageUrls = row["Input Image Urls"];

      if (!productName || !imageUrls) {
        console.log(`Row ${rowNumber}: Missing values`);
        return;
      }

      const urls = imageUrls.split(",").map((url) => url.trim());
      for (const url of urls) {
        if (!url.startsWith("https")) {
          console.log(`Row ${rowNumber}: Invalid URL - ${url}`);
        } else {
          try {
            const response = await axios.head(url);
            if (response.status !== 200) {
              console.log(`Row ${rowNumber}: URL not accessible - ${url}`);
            }
          } catch (error) {
            console.log(`Row ${rowNumber}: Failed to reach the URL - ${url}`);
          }
        }
      }

      const product = {
        productName: productName,
        fileId: fileId,
        inputImgUrls: urls,
      };
      console.log(product);

      const createdProduct = await Product.create(product);
      console.log(createdProduct);
    })

    .on("end", () => {
      console.log("CSV Validation Completed!!");
    });
}

const processTask = async () => {
  try {
    const value = await redis.lpop("task");

    if (value) {
      const valueObj = JSON.parse(value);
      const fileId = valueObj.id;
      const filePath = valueObj.csvFilePath;

      await validateCSV(fileId, filePath);
    }
  } catch (error) {
    console.error("error:", error);
  }
};

module.exports = processTask;
