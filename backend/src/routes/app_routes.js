const express = require("express");
const router = express.Router();
const { UserRepository } = require("../repositories/UserRepository.js");

const {dashboard,getAllUsers,loginUser,registerUser} = require("../controllers/main_controller.js");

const authMiddleware = require("../middleware/auth.js");

<<<<<<< HEAD
=======
const { sendTestEmail } = require("../controllers/campaign_controller");

const { createCampaign } = require("../controllers/campaign_controller");
const authenticationMiddleware = require("../middleware/auth.js");

>>>>>>> origin/email-feature
router.get("/", (req, res) => res.send("Backend running. Try /health"));
router.get("/health", (req, res) => res.json({ ok: true }));

// This can /definitely/ be cleaned up, but can be left for now
router.route('/dashboard').get(authMiddleware, dashboard);
router.route('/users/').get(getAllUsers);
router.route('/login').post(loginUser);
router.route('/register').post(registerUser);

<<<<<<< HEAD
=======
router.post("/send-test-email", sendTestEmail);
router.post("/campaigns", authenticationMiddleware, createCampaign);

>>>>>>> origin/email-feature
module.exports=router;