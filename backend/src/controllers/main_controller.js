require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const { UserRepository } = require("../repositories/UserRepository");
const { CampaignRepository } = require("../repositories/CampaignRepository");
const { BadRequestError, CustomAPIError } = require("../errors");

const userRepo = new UserRepository();
const campaignRepo = new CampaignRepository();

const dashboard = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestError("Authenticated user is required.");
    }

    const stats = await campaignRepo.getDashboardStatsForUser(userId);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await userRepo.getAll();
    res.status(200).json({ users: allUsers });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  console.log("[loginUser] request body:", req.body);

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password.");
  }

  try {
    const foundUser = await userRepo.getByEmail(email);
    console.log("[loginUser] found user:", foundUser);
    console.log("[loginUser] stored passwordHash:", foundUser?.passwordHash);

    if (!foundUser) {
      throw new CustomAPIError("Invalid email or password.", StatusCodes.UNAUTHORIZED);
    }

    const foundUserId = foundUser.id;
    const passwordMatches = await bcrypt.compare(password, foundUser.passwordHash);

    if (!passwordMatches) {
      throw new CustomAPIError("Invalid email or password.", StatusCodes.UNAUTHORIZED);
    }

    const tokenExpiry = process.env.JWT_SECRET_EXPIRES || "1d";
    const token = jwt.sign(
      { id: foundUserId, email: foundUser.email },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    res.status(200).json({ token: token });
  } catch (error) {
    console.error("[loginUser] login failed:", error);
    next(error);
  }
};

const registerUser = async (req, res, next) => {
  const { email, password } = req.body;
  console.log("[registerUser] request body:", req.body);

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("[registerUser] hashed password:", hashedPassword);
    const createdUser = await userRepo.create(email, hashedPassword);
    res.status(200).json({ createdUser });
  } catch (err) {
    console.error("[registerUser] registration failed:", err);
    next(err);
  }
};

module.exports = {
  dashboard,
  getAllUsers,
  loginUser,
  registerUser,
};
