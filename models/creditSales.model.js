const mongoose = require("mongoose");

const creditSalesSchema = new mongoose.Schema(
    {
        buyerName: { 
            type: String, 
            required: true, 
            minlength: 2, 
            trim: true 
        },
        nin: { 
            type: String, 
            required: true, 
            minlength: 5, 
            trim: true 
        },
        location: { 
            type: String, 
            required: true, 
            minlength: 2, 
            trim: true 
        },
        contacts: { 
            type: String, 
            required: true, 
            match: /^[0-9]{10,13}$/ 
        },
        amountDue: { 
            type: Number, 
            required: true, 
            min: 0 
        },
        salesAgentName: { 
            type: String, 
            required: true, 
            minlength: 2, 
            trim: true 
        },
        dueDate: { 
            type: Date, 
            required: true 
        },
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
        tonnage: { 
            type: Number, 
            required: true, 
            min: 1 
        },
        dispatchDate: { 
            type: Date, 
            required: true 
        },
        branch: { 
            type: String, 
            enum: ["Maganjo", "Matugga"], 
            required: true 
        },
        dateAndTime: { 
            type: Date, 
            default: Date.now 
        },
    },
    { timestamps: true },
);

const creditSalesModel = mongoose.model("creditSales", creditSalesSchema);

module.exports = { creditSalesModel };
