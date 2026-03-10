const express = require("express");
const router = express.Router();
const { UserRepository } = require("../repositories/UserRepository.js");

const {dashboard,getAllUsers,loginUser,registerUser} = require("../controllers/main_controller.js");

const authMiddleware = require("../middleware/auth.js");

router.get("/", (req, res) => res.send("Backend running. Try /health"));
router.get("/health", (req, res) => res.json({ ok: true }));

// This can /definitely/ be cleaned up, but can be left for now
router.route('/dashboard').get(authMiddleware, dashboard);
router.route('/users/').get(getAllUsers);
router.route('/login').post(loginUser);
router.route('/register').post(registerUser);

module.exports=router;