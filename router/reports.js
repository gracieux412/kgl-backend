const express = require('express');
const { salesModel } = require('../models/sales.model.js');
const { stockModel } = require('../models/stock.model.js');
const { creditSalesModel } = require('../models/creditSales.model.js');
const { procurementModel } = require('../models/procurement.model.js');
const { verifyToken, requireRoles } = require('../middleware/auth.midleware.js');
const router = express.Router()

function parseDates(req) {
    const from = req.query.from ? new Date(req.query.from) : null
    const to = req.query.to ? new Date(req.query.to) : null
    const match = {}
    if (from) match.dateAndTime = { $gte: from }
    if (to) match.dateAndTime = Object.assign(match.dateAndTime || {}, { $lte: to })
    return match
}

router.get("/reports/sales/aggregate", verifyToken, requireRoles("director"), async (req, res) => {
    try {
        const match = Object.assign({ }, parseDates(req))
        const pipeline = [
            { $match: match },
            { $group: { _id: "$branch", totalAmount: { $sum: "$amountPaid" }, totalTonnage: { $sum: "$tonnage" }, count: { $sum: 1 } } },
            { $project: { branch: "$_id", _id: 0, totalAmount: 1, totalTonnage: 1, count: 1 } }
        ]
        const data = await salesModel.aggregate(pipeline)
        res.status(200).json({ message: "aggregated sales", body: data })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.get("/reports/sales/branch", verifyToken, requireRoles("manager"), async (req, res) => {
    try {
        const match = Object.assign({ branch: req.user.branch }, parseDates(req))
        const pipeline = [
            { $match: match },
            { $group: { _id: "$produceName", totalAmount: { $sum: "$amountPaid" }, totalTonnage: { $sum: "$tonnage" }, count: { $sum: 1 } } },
            { $project: { produceName: "$_id", _id: 0, totalAmount: 1, totalTonnage: 1, count: 1 } }
        ]
        const data = await salesModel.aggregate(pipeline)
        res.status(200).json({ message: "branch sales", body: data })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})


router.get("/reports/overview/agent", verifyToken, requireRoles("sale-agent"), async (req, res) => {
    try {
        const branch = req.user.branch;
        const [salesAgg] = await salesModel.aggregate([
            { $match: { branch } },
            { $group: { _id: null, totalAmount: { $sum: "$amountPaid" } } }
        ]);
        const [creditAgg] = await creditSalesModel.aggregate([
            { $match: { branch } },
            { $group: { _id: null, totalDue: { $sum: "$amountDue" } } }
        ]);
        res.status(200).json({
            message: "agent overview totals",
            body: {
                totalSales: salesAgg?.totalAmount || 0,
                totalCredits: creditAgg?.totalDue || 0,
            }
        });
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

module.exports = { router }

router.get("/reports/overview", verifyToken, requireRoles("director"), async (req, res) => {
    try {
        const [stockAgg] = await stockModel.aggregate([{ $group: { _id: null, totalTonnage: { $sum: "$tonnage" }, branches: { $addToSet: "$branch" } } }])
        const [salesAgg] = await salesModel.aggregate([{ $group: { _id: null, totalAmount: { $sum: "$amountPaid" } } }])
        const [creditAgg] = await creditSalesModel.aggregate([{ $group: { _id: null, totalDue: { $sum: "$amountDue" } } }])
        res.status(200).json({
            message: "overview totals",
            body: {
                totalStock: stockAgg?.totalTonnage || 0,
                totalSales: salesAgg?.totalAmount || 0,
                totalCredits: creditAgg?.totalDue || 0,
                activeBranches: Array.isArray(stockAgg?.branches) ? stockAgg.branches.length : 0
            }
        })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.get("/reports/overview/branch", verifyToken, requireRoles("manager"), async (req, res) => {
    try {
        const branch = req.user.branch;
        const [stockAgg] = await stockModel.aggregate([
            { $match: { branch } },
            { $group: { _id: null, totalTonnage: { $sum: "$tonnage" } } }
        ]);
        const [salesAgg] = await salesModel.aggregate([
            { $match: { branch } },
            { $group: { _id: null, totalAmount: { $sum: "$amountPaid" } } }
        ]);
        const [creditAgg] = await creditSalesModel.aggregate([
            { $match: { branch } },
            { $group: { _id: null, totalDue: { $sum: "$amountDue" } } }
        ]);
        const lowStockAlerts = await stockModel.countDocuments({ branch, tonnage: { $lte: 1 } });
        res.status(200).json({
            message: "branch overview totals",
            body: {
                totalStock: stockAgg?.totalTonnage || 0,
                totalSales: salesAgg?.totalAmount || 0,
                totalCredits: creditAgg?.totalDue || 0,
                lowStockAlerts
            }
        });
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.get("/reports/procurements/aggregate", verifyToken, requireRoles("director"), async (req, res) => {
    try {
        const from = req.query.from ? new Date(req.query.from) : null
        const to = req.query.to ? new Date(req.query.to) : null
        const match = {}
        if (from) match.dateAndTime = { $gte: from }
        if (to) match.dateAndTime = Object.assign(match.dateAndTime || {}, { $lte: to })
        const pipeline = [
            { $match: match },
            { $group: { _id: "$branch", totalCost: { $sum: "$cost" }, totalTonnage: { $sum: "$tonnage" }, count: { $sum: 1 } } },
            { $project: { branch: "$_id", _id: 0, totalCost: 1, totalTonnage: 1, count: 1 } }
        ]
        const data = await procurementModel.aggregate(pipeline)
        res.status(200).json({ message: "aggregated procurements", body: data })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})
