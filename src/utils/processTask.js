const redis = require("./client");
const fs = require("fs");
const axios = require("axios");
const csv = require("csv-parser");

async function validateCSV(filePath) {
  const results = [];
  const rowPromises = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", async (row) => {
        const rowPromise = (async () => {
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
                console.log(
                  `Row ${rowNumber}: Failed to reach the URL - ${url}`
                );
              }
            }
          }

          const tempRow = {
            productName: productName,
            inputUrls: urls,
          };
          results.push(tempRow);
        })();

        rowPromises.push(rowPromise);
      })

      .on("end", async () => {
        await Promise.all(rowPromises);
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

const processTask = async () => {
  try {
    const value = await redis.lpop("task");

    if (value) {
      const valueObj = JSON.parse(value);
      const id = valueObj.id;
      const filePath = valueObj.csvFilePath;

      const results = await validateCSV(filePath);
      console.log(results);
    }
  } catch (error) {
    console.error("error:", error);
  }
};

module.exports = processTask;
