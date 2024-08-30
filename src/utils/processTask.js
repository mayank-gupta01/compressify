const redis = require("./client");
const uploadAndCompressOnCloudinary = require("../utils/cloudinary");
const Product = require("../models/product.model");
const File = require("../models/file.model");
const { Types } = require("mongoose");

//create Products and update the status of file.
const createProducts = async (products, fileId) => {
  try {
    //loop throguh the products
    for (let i = 0; i < products.length; i++) {
      const { productName, inputImgUrls, processedImgUrl } = products[i];
      const newProduct = {
        fileId,
        productName,
        inputImgUrls,
        processedImgUrl,
      };
      await Product.create(newProduct);
    }

    //update the file with status : success
    await File.findByIdAndUpdate(fileId, {
      $set: {
        status: "SUCCESS",
      },
    });
  } catch (error) {
    console.log("err", error);
    throw error;
  }
};

const processTask = async () => {
  try {
    const value = await redis.lpop("task");

    if (value) {
      const valueObj = JSON.parse(value);
      const fileId = valueObj.id;
      const products = valueObj.results;

      //compress images via clodinary
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const processImgUrls = await uploadAndCompressOnCloudinary(
          fileId,
          product
        );

        console.log(processImgUrls);
        products[i].processedImgUrl = processImgUrls;
      }

      //create the products and update the file status
      await createProducts(products, fileId);

      //trigger the webhook for generating the output file.
      console.log("trigger the webhook");
    }
  } catch (error) {
    console.error("error:", error);
  }
};

module.exports = processTask;
