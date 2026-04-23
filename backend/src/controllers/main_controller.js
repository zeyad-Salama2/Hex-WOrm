require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const { z } = require("zod");
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
    console.log("[loginUser] request body:", req.body);
    if(!email || !password) {
        throw new BadRequestError('Please provide email and password.');
    }
    try{
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

const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
        .refine((password) => /[A-Z]/.test(password), { message: "Password must contain at least one uppercase letter."})
        .refine((password) => /[0-9]/.test(password), { message: "Password must contain a number."})
        .refine((password) => /[^A-Za-z0-9]/.test(password), { message: "Passwords must contain a special character."})
})

const registerUser = async (req, res, next) => {
    const { email, password } = req.body;
    console.log("[registerUser] request body:", req.body);

    if (!email || !password) {
        throw new BadRequestError("Please provide email and password.");
    }

    try {
        userSchema.parse({email, password});
    } catch(err) {
        console.error("[registerUser] registration failed:", err);
        throw new CustomAPIError("Data validation failed", StatusCodes.BAD_REQUEST)
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
    dashboard,getAllUsers,loginUser,registerUser
}
