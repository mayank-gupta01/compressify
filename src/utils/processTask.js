const redis = require("./client");
const uploadAndCompressOnCloudinary = require("../utils/cloudinary");
const Product = require("../models/product.model");
const File = require("../models/file.model");
const axios = require("axios").default;

//create Products and update the status of file.
const createProducts = async (products, fileId) => {
  try {
    //loop throguh the products
    for (let i = 0; i < products.length; i++) {
      const { productName, inputImgUrls, processedImgUrls } = products[i];
      const newProduct = {
        fileId,
        productName,
        inputImgUrls,
        processedImgUrls,
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

const triggerWebhook = async (webhookUrl, payload) => {
  try {
    const response = await axios.post(webhookUrl, payload);
    const { data } = response;
    if (data.statusCode !== 200) {
      throw new Error("Something went wrong while generating output csv file");
    }

  } catch (error) {
    console.log(error);
    throw error;
  }
};


//pop the task from the redis queue, and process them one by one.
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

        // console.log(processImgUrls);
        products[i].processedImgUrls = processImgUrls;
      }

      //create the products and update the file status
      await createProducts(products, fileId);

      //trigger the webhook for generating the output file.
      console.log("trigger the webhook");
      const webhookUrl = `${process.env.BASE_URL}/api/v1/product/generateCSV`;
      const payload = {
        products,
      };

      //function for triggering the webhook for generate the output csv file.
      await triggerWebhook(webhookUrl, payload);
    }
  } catch (error) {
    console.error("error:", error);
    throw error;
  }
};

module.exports = processTask;
