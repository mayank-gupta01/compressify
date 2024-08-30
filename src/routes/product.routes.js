const { Router } = require("express");
const {
  uploadCSV,
  trackStatus,
  generateCSV,
} = require("../controllers/product.controller");
const upload = require("../middlewares/multer.middlewares");
const router = Router();

router.route("/upload").post(
  upload.fields([
    {
      name: "csvfile",
      maxCount: 1,
    },
  ]),
  uploadCSV
);
router.route("/status/:id").get(trackStatus);
router.route("/generateCSV").post(generateCSV);

module.exports = router;
