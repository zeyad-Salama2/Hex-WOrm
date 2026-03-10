require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const { UserRepository } = require("../repositories/UserRepository");
const { BadRequestError, CustomAPIError } = require("../errors");

const dashboard = async(req, res) => {
    // Authorisation is handled in 
    res.status(200).json({msg:`Welcome user ${req.user.name}`});
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
    const {name,email,password} = req.body;
    if(!name || !email || !password) {
        throw new BadRequestError('Please provide name, email and password.');
    }
    try{
        // A lot of this could maybe be made into middleware?
        // Will have to try that out at some point, but no biggie if it can't
        const foundUser = await userRepo.getByEmail(email);
        const foundUserId = foundUser.id;

        // Checking if the stored password hash and the inputted password match
        bcrypt.compare(password,foundUser.passwordHash, (err,result) => {
            if(err) {
                return;
            }
            // Maybe have a limit on how many times a user can attempt to log in? Three attempts then try again in a few minutes?
            if(result) {
                // Creates the JSON Web Token that we'll use for user authentication
                const token = jwt.sign({foundUserId, name},process.env.JWT_SECRET,{expiresIn: process.env.JWT_SECRET_EXPIRES});

                res.status(200).json({token:token});
            }
        });
        throw new CustomAPIError("Invalid password.", StatusCodes.INTERNAL_SERVER_ERROR);
    } catch(error) {
        console.log(error);
        next(error);
    }
}

const registerUser = async(req,res,next) => {
    const {name,email,password} = req.body;
    if(!name || !email || !password) {
        throw new BadRequestError('Please provide name, email and password.');
    }
    try {
        const createdUser = await userRepo.create(name,email,password);
        res.status(200).json({"createdUser":createdUser});
    } catch(err) {
        console.log(err);
        next(err);
    }
}

module.exports = {
    dashboard,getAllUsers,loginUser,registerUser
}