const express = require('express');
const { userModel } = require('../models/users.model');
const router = express.Router()
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { loginController, registerController } = require('../controllers/authController');   



const verifytoken = async(req, res, next) => {
    const authHeader = req.headers["authorization"]
    if(!authHeader) return res.status(401).json({message: "Not authorized"})
    
    const token = authHeader.split(" ")[1]

    jwt.verify(token, process.env.JWT_SECRET, (err, user)=>{
        if(err){
            res.status(403).json({message: "invalid token"})
            return
        }
        req.user = user;
        next()
    })   
    
}


// create an auth api
router.post("/login", loginController)

//register user
router.post("/register", registerController)

// get current user
router.get("/me", verifytoken, async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});



module.exports = { router }