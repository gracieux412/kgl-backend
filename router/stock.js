const express = require('express');
const { stockModel } = require('../models/stock.model.js');
const { verifyToken, requireRoles } = require('../middleware/auth.midleware.js');
const router = express.Router()

router.get("/stock", verifyToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, search, branch, produceType } = req.query;
        const query = {};

        if (search) {
            query.produceName = { $regex: search, $options: 'i' };
        }

        if (branch) query.branch = branch;
        if (produceType) query.produceType = produceType;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [items, totalItems] = await Promise.all([
            stockModel.find(query).sort({ produceName: 1 }).skip(skip).limit(parseInt(limit)),
            stockModel.countDocuments(query)
        ]);

        res.status(200).json({
            message: "all stock",
            body: items,
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (err) {
        res.status(400).json({ message: "failed to fetch stock" })
    }
});

router.post('/stock', verifyToken, requireRoles('manager'), async (req, res) => {
    try {
        const item = await stockModel.create(req.body);
        res.status(201).json({ message: 'stock item added', body: item });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/stock/:_id', verifyToken, requireRoles('manager'), async (req, res) => {
    try {
        const id = req.params._id;
        const updated = await stockModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'not found' });
        res.status(200).json({ message: 'updated', body: updated });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/stock/:_id', verifyToken, requireRoles('manager'), async (req, res) => {
    try {
        const id = req.params._id;
        const deleted = await stockModel.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'not found' });
        res.status(200).json({ message: 'deleted', body: deleted });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get("/stock/alerts", verifyToken, async (req, res) => {
    try {
        const threshold = parseFloat(req.query.threshold || "1")
        const items = await stockModel.find({ tonnage: { $lte: threshold } })
        res.status(200).json({ message: "stock alerts", body: items })
    } catch (err) {
        res.status(400).json({ message: err })
    }
})

module.exports = { router }
