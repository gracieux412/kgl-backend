const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
    produceName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    produceType: { 
        type: String, 
        required: true, 
        trim: true 
    },
    branch: { 
        type: String, 
        enum: ["Maganjo", "Matugga"], 
        required: true 
    },
    tonnage: { 
        type: Number, 
        required: true, 
        min: 0, 
        default: 0 
    },
    sellingPrice: { 
        type: Number, 
        required: true, 
        min: 0 
    }
}, { timestamps: true });

stockSchema.index({ produceName: 1, produceType: 1, branch: 1 }, { unique: true });

const stockModel = mongoose.model("stocks", stockSchema);

module.exports = { stockModel }
