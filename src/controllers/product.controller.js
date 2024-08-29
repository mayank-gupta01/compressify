const fs = require("fs");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const Product = require("../models/product.model");

//validate the csv file
//process every image via url and upload it on the cloudinary
//save the product info in the db
//call a webhook which create a csv file

const uploadCSV = asyncHandler(async (req, res) => {
  //create a doc in db and return the response
  const createProduct = await Product.create({
    status: "PROCESSING",
  });

  

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Product Created Successfully", {
        requestId: createProduct._id,
      })
    );
});

const trackStatus = async (req, res) => {
  //find the requested Id in the db ? return the response : return the error
};

module.exports = { uploadCSV, trackStatus };
