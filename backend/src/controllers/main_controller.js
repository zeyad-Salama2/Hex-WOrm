require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const { UserRepository } = require("../repositories/UserRepository");
const { BadRequestError, CustomAPIError } = require("../errors");

const dashboard = async(req, res) => {
    // Authorisation is handled in 
    res.status(200).json({msg:`Welcome user ${req.user.email}`});
}


// In the future these should all be in their own file; for now, they're fine where they are
// ===============================================================================================
// User Queries
// ===============================================================================================
const userRepo = new UserRepository();

const getAllUsers = async (req,res,next) => {
    try {
        const allUsers = await userRepo.getAll();
        res.status(200).json({ users: allUsers });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const loginUser = async(req,res,next) => {
    const {email,password} = req.body;
<<<<<<< HEAD
=======
    console.log("[loginUser] request body:", req.body);
>>>>>>> origin/email-feature
    if(!email || !password) {
        throw new BadRequestError('Please provide email and password.');
    }
    try{
        const foundUser = await userRepo.getByEmail(email);
<<<<<<< HEAD
=======
        console.log("[loginUser] found user:", foundUser);
        console.log("[loginUser] stored passwordHash:", foundUser?.passwordHash);
>>>>>>> origin/email-feature
        if (!foundUser) {
            throw new CustomAPIError("Invalid email or password.", StatusCodes.UNAUTHORIZED);
        }

        const foundUserId = foundUser.id;
        const passwordMatches = await bcrypt.compare(password, foundUser.passwordHash);

        if (!passwordMatches) {
            throw new CustomAPIError("Invalid email or password.", StatusCodes.UNAUTHORIZED);
        }

        // Creates the JSON Web Token that we'll use for user authentication
        const tokenExpiry = process.env.JWT_SECRET_EXPIRES || "1d";
        const token = jwt.sign(
            {id: foundUserId, email: foundUser.email},
            process.env.JWT_SECRET,
            {expiresIn: tokenExpiry}
        );
        res.status(200).json({token:token});
    } catch(error) {
        console.error("[loginUser] login failed:", error);
        next(error);
    }
}

<<<<<<< HEAD
const registerUser = async(req,res,next) => {
    const {email,password} = req.body;
    console.log("[registerUser] request body:", req.body);
    if(!email || !password) {
        throw new BadRequestError('Please provide email and password.');
    }
    try {
        const createdUser = await userRepo.create(email,password);
        res.status(200).json({"createdUser":createdUser});
    } catch(err) {
        console.error("[registerUser] registration failed:", err);
        next(err);
    }
}
=======
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
>>>>>>> origin/email-feature

module.exports = {
    dashboard,getAllUsers,loginUser,registerUser
}
