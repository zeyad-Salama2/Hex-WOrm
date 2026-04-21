const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.js");

// importing campaign controller handlers
// could destructure later if this grows too big
const {
createCampaign,
getAllCampaigns,
getCampaignById,
updateCampaign,
deleteCampaign,
} = require("../controllers/campaign_controller.js");

// routes for campaign collection
// POST -> create
// GET -> list
router
.route("/")
.post(authMiddleware, createCampaign) // user must be logged in
.get(authMiddleware, getAllCampaigns);

// routes for individual campaign
// using :id param from url
router
.route("/:id")
.get(authMiddleware, getCampaignById)
.patch(authMiddleware, updateCampaign) // patch instead of put since partial updates
.delete(authMiddleware, deleteCampaign);

// exporting router so it can be mounted in main app
module.exports = router;

// quick note to myself:
// if routes start getting bigger we might split admin vs user campaign routes
// but for now this is fine.