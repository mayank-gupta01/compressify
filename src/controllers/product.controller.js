const fs = require("fs");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const File = require("../models/file.model");
const ApiError = require("../utils/ApiError");
const redis = require("../utils/client");
const axios = require("axios").default;
const csv = require("csv-parser");

async function validateCSV(filePath) {
  const results = [];
  const promises = [];

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath).pipe(csv());

    stream.on("data", (row) => {
      const processRowPromise = (async () => {
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
            throw new Error("Validation not successful");
          } else {
            try {
              const response = await axios.get(url);
              const contentType = response.headers["content-type"];
              console.log(contentType);
              if (
                response.status !== 200 ||
                !contentType ||
                !contentType.startsWith("image")
              ) {
                console.log(`Row ${rowNumber}: URL not accessible - ${url}`);
                throw new Error("Validation not successful");
              }
            } catch (error) {
              console.log(`Row ${rowNumber}: URL fetch failed - ${url}`);
              throw new Error("Validation not successful");
            }
          }
        }

        const product = {
          productName: productName,
          inputImgUrls: urls,
        };
        console.log(product);

        results.push(product);
      })().catch(reject);

      promises.push(processRowPromise);
    });

    stream.on("end", () => {
      Promise.all(promises)
        .then(() => {
          console.log("CSV Validation Completed!!");
          resolve(results);
        })
        .catch(reject);
    });

    stream.on("error", (err) => {
      console.log("Error reading CSV file: ", err);
      reject(err);
    });
  });
}

//save the product info in the db
//call a webhook which create a csv file

const uploadCSV = asyncHandler(async (req, res) => {
  //fetch the csv file and store it using multer
  const csvFilePath = req.files.csvfile[0].path;

  //validate the csv file
  const results = await validateCSV(csvFilePath);
  if (!results || results.length === 0) {
    throw new ApiError(400, "Something wrong in csv file");
  }
  console.log(results);

  //create a doc in db and return the response
  const createFile = await File.create({
    status: "PROCESSING",
  });

  //add the fetched file and product->id in redis queue
  const id = createFile._id;
  const value = JSON.stringify({ id, results });
  redis.rpush("task", value);

  return res.status(201).json(
    new ApiResponse(201, "Product Created Successfully", {
      requestId: id,
    })
  );
});

const trackStatus = asyncHandler(async (req, res) => {
  //find the requested Id in the db ? return the response : return the error
  const { id } = req.params;
  const existedDoc = await File.findById(id);
  if (!existedDoc) {
    throw new ApiError(400, "File doesn't existed");
  } else {
    return res.status(200).json(
      new ApiResponse(200, "Product Fetched Successfully", {
        status: existedDoc.status,
      })
    );
  }
});

module.exports = { uploadCSV, trackStatus };
