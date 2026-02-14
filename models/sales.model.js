const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({

    saleType: {
        type: String,
        enum: ["cash", "credit"],
        required: true
    },

    produceName: {
        type: String,
        required: true,
        trim: true,
        match: [/^[a-zA-Z0-9\s]+$/, "Produce name must be alphanumeric"]
    },

    tonnage: {
        type: Number,
        required: true,
        min: [100, "Tonnage must be at least 100kg"]
    },

    amountPaid: {
        type: Number,
        required: true,
        min: [10000, "Amount must be at least 5 digits"]
    },

    buyerName: {
        type: String,
        required: true,
        minlength: [2, "Buyer name must be at least 2 characters"],
        match: [/^[a-zA-Z0-9\s]+$/, "Buyer name must be alphanumeric"]
    },

    salesAgentName: {
        type: String,
        required: true,
        minlength: [2, "Agent name must be at least 2 characters"],
        match: [/^[a-zA-Z0-9\s]+$/, "Agent name must be alphanumeric"]
    },

    branch: {
        type: String,
        enum: ["Majango", "Matugga"],
        required: true
    },

    dateAndTime: {
        type: Date,
        // required: true,
        default: Date.now
    }

}, {
    timestamps: true
});


const salesModel = mongoose.model("sales", salesSchema)

module.exports = { salesModel }