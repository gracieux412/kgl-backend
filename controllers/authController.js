const { userModel } = require('../models/users.model');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const loginController = async (req, res) => {

    console.log(req.body)
    const {email, password} = req.body
    // user from the database
    let _user = await userModel.findOne({email})

    if(!_user){
        return res.status(401).json({message: "User not found"})
    }

    const comparePassword = await bcrypt.compare(password, _user?.password)

    console.log(_user)

    if(_user && comparePassword){
        const user = {
            role: _user.role,
            email: _user.email,
            username: _user.username,
            branch: _user.branch,
            id: _user._id
        }
        let token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h"})
        
        res.status(200).json({message: "Login successfully", token: token, user})
    }else{
        res.status(401).json({message: "invalid credentials"})
    }

}

const registerController = async (req, res) => {
    let body = req.body

    const passwordHash = await bcrypt.hash(body.password,10)

    body.password = passwordHash

    try{
        let user = await userModel(body)
        user.save().then((data)=>{
            res.status(201).json({message: "User created successfully", body: data})    
        })
    }catch(err){
        console.error(err)
        res.status(500).json({message: "Internal server error"})
    }
}

module.exports = {
    loginController,
    registerController
}
