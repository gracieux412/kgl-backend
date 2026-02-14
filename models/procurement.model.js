const mongoose = require("mongoose");

const procurementSchema = new mongoose.Schema({

    produceName: {
        type: String,
        required: true,
        trim: true,
        match: /^[a-zA-Z0-9\s]+$/
    },
    produceType: {
        type: String,
        required: true,
        minlength: 2,
        match: /^[a-zA-Z\s]+$/
    },
    dateAndTime: {
        type: Date,
        required: true
    },
    tonnage: {
        type: Number,
        required: true,
        min: 100
    },
    cost: {
        type: Number,
        required: true,
        min: 10000
    },
    dealerName: {
        type: String,
        required: true,
        minlength: 2,
        match: /^[a-zA-Z0-9\s]+$/
    },
    branch: {
        type: String,
        enum: ["Majango", "Matugga"],
        required: true
    },
    contact: {
        type: String,
        required: true,
        match: /^[0-9]{10,13}$/
    },
    sellingPrice: {
        type: Number,
        required: true,
        min: 1000
    }
}, { timestamps: true 
    
});


const procurementModel = mongoose.model("procurements", procurementSchema)

module.exports = {procurementModel}