const jwt = require('jsonwebtoken');
const config =require('config');

module.exports = function (req, res, next) {
    
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    try{
        const cleantoken= token.startsWith("Bearer ") ? token.split(" ")[1] : token;
        const verify=jwt.verify(cleantoken,process.env.JWT_SECRET || "temporary_development_secret_key");

        req.user=verify;

        next();
    }
    catch(error) {
        res.status(400).json({ message: "Invalid or expired token." });
    }
};