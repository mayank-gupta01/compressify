const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadAndCompressOnCloudinary = async (fileId, product) => {
  try {
    const { inputImgUrls, productName } = product;
    const processImgUrls = [];
    for (let i = 0; i < inputImgUrls.length; i++) {
      const imgUrl = inputImgUrls[i];
      const response = await cloudinary.uploader.upload(imgUrl, {
        quality: 50,
      });

      processImgUrls.push(response.url);
    //   console.log("Product name: ", productName);
    //   console.log("Original URL: ", imgUrl);
    //   console.log("Cloudinary URL ------------>>>>>>>>>>", response);
    //   console.log();
    //   console.log();
    }

    return processImgUrls;
  } catch (error) {
    console.log("err: ", err);
  }
};

module.exports = uploadAndCompressOnCloudinary;
