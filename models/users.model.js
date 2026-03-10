const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        unique: true, 
        required: true 
    },
    email: { 
        type: String, 
        unique: true, 
        required: true
    },
    password: { 
        type: String, 
        required: true 
    },
    role: {
        type: String,
        enum: ["admin", "director", "manager", "sale-agent"],
        required: true,
    },
    branch: {
        type:String,
        enum: ["Maganjo", "Matugga"],
        required: function() {
            return this.role !== 'director' && this.role !== 'admin';
        }
    }
});


const userModel = mongoose.model("user", userSchema)

module.exports = {userModel}
