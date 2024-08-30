const fs = require("fs");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const File = require("../models/file.model");
const ApiError = require("../utils/ApiError");
const redis = require("../utils/client");

//validate the csv file
//process every image via url and upload it on the cloudinary
//save the product info in the db
//call a webhook which create a csv file

const uploadCSV = asyncHandler(async (req, res) => {
  //create a doc in db and return the response
  const createFile = await File.create({
    status: "PROCESSING",
  });

  //fetch the csv file and store it using multer
  const csvFilePath = req.files.csvfile[0].path;
  //console.log(csvFilePath);

  //add the fetched file and product->id in redis queue
  const id = createFile._id;
  const value = JSON.stringify({ id, csvFilePath });
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
