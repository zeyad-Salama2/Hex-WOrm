const express = require("express");
const router = express.Router();

const {
  trackOpen,
  trackClick,
  trackSubmit,
} = require("../controllers/tracking_controller");

router.get("/open", trackOpen);
router.get("/click", trackClick);
router.post("/submit", trackSubmit);

module.exports = router;