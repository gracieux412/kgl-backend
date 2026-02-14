const express = require('express');
const { userModel } = require('../models/users.model');
const router = express.Router()
const jwt = require("jsonwebtoken");
const { checkUserAuth } = require('../middleware/auth.midleware');


// create an auth api
router.post("/login", checkUserAuth, async (req, res) => {
    const {email, password} = req.body
    // user from the database
    let _user = await userModel.findOne({email, password})

    if(_user){
        // const user = {
        //     username : _user.username,
        //     email: _user.email
        // }
        // let token = jwt.sign(user, proccess.env.JWT_SECRET, { expiresIn: "1h"})
        
        res.status(200).json({message: "Login successfully"})
    }else{
        res.status(401).json({message: "invalid credentials"})
    }

})


module.exports = { router }