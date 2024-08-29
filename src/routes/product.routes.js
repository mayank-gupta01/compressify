const { Router } = require("express");
const { uploadCSV, trackStatus } = require("../controllers/product.controller");

const router = Router();

router.route("/upload").post(uploadCSV);
router.route("/status").get(trackStatus);

module.exports = router;
