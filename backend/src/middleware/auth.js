const jwt = require("jsonwebtoken");
require("dotenv").config();
const { UnauthenticatedError } = require("../errors");

const authenticationMiddleware = async (req,res,next) => {
    const authHeader = req.headers.authorization;
    
    // Checks the authorisation header is present & valid
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthenticatedError("Token not provided.")
    }

    // Retrieves the token from the header
    const token = authHeader.split(" ")[1];
    
    try {
        // Decodes the JWT, then passes on the retrieved id & user from it
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const {id, email} = decoded;
        req.user = {id, email}
        next();
    } catch(error) {
        throw new UnauthenticatedError("Not authorised to access this route");
    }
}

module.exports = authenticationMiddleware;
