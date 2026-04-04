const express = require("express");
const router = express.Router();

const { dashboard, getAllUsers, loginUser, registerUser } = require("../controllers/main_controller.js");
const { sendTestEmail } = require("../controllers/campaign_controller");
const authMiddleware = require("../middleware/auth.js");

router.get("/", (req, res) => res.send("Backend running. Try /health"));
router.get("/health", (req, res) => res.json({ ok: true }));

router.route("/dashboard").get(authMiddleware, dashboard);
router.route("/users/").get(getAllUsers);
router.route("/login").post(loginUser);
router.route("/register").post(registerUser);
router.post("/send-test-email", sendTestEmail);

module.exports = router;
