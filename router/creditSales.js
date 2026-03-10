const express = require('express');
const { creditSalesModel } = require('../models/creditSales.model.js');
const { stockModel } = require('../models/stock.model.js');
const { procurementModel } = require('../models/procurement.model.js');
const { verifyToken, requireRoles } = require('../middleware/auth.midleware.js');
const router = express.Router();

// create credit sale
router.post('/credits', verifyToken, requireRoles('manager','sale-agent'), async (req,res)=>{
    try{
        const body = req.body;
        const requestedTonnage = parseFloat(body.tonnage);
        
        // Use case-insensitive search for the stock item
        const key = { 
            produceName: { $regex: new RegExp(`^${body.produceName}$`, 'i') }, 
            produceType: { $regex: new RegExp(`^${body.produceType}$`, 'i') }, 
            branch: body.branch 
        };
        const stock = await stockModel.findOne(key);
        
        if(!stock){
            return res.status(400).json({ message: `No stock found for ${body.produceName} (${body.produceType}) at ${body.branch}` });
        }
        
        if(stock.tonnage < requestedTonnage){
            return res.status(400).json({ message: `Insufficient stock. Available: ${stock.tonnage}kg` });
        }
        
        const credit = await creditSalesModel.create(body);
        
        // Update stock and procurement using the actual stock record's keys (to avoid regex issues in update)
        const updateKey = { produceName: stock.produceName, produceType: stock.produceType, branch: stock.branch };
        await stockModel.updateOne(updateKey,{ $inc: { tonnage: -requestedTonnage } });
        await procurementModel.updateOne(updateKey,{ $inc: { tonnage: -requestedTonnage } });
        
        res.status(201).json({ message:'credit sale created', body: credit });
    } catch(err){
        res.status(400).json({ message: err.message || 'failed to create credit sale' });
    }
});

// get all credit sales
router.get('/credits', verifyToken, async (req,res)=>{
    try{
        const { page = 1, limit = 10, search, startDate, endDate, produceType } = req.query;
        const query = {};

        // Role-based filtering
        if (req.user.role === 'manager' || req.user.role === 'sale-agent') {
            query.branch = req.user.branch;
        } else if (req.query.branch) {
            query.branch = req.query.branch;
        }

        // Search filter (buyerName)
        if (search) {
            query.buyerName = { $regex: search, $options: 'i' };
        }

        // Produce type filter
        if (produceType) {
            query.produceType = produceType;
        }

        // Date range filter (using dueDate or createdAt - let's use dateAndTime if it exists, otherwise createdAt)
        if (startDate || endDate) {
            query.dateAndTime = {}; // Assuming dateAndTime is the standard field across models
            if (startDate) query.dateAndTime.$gte = new Date(startDate);
            if (endDate) query.dateAndTime.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [list, totalItems] = await Promise.all([
            creditSalesModel.find(query).sort({ dateAndTime: -1 }).skip(skip).limit(parseInt(limit)),
            creditSalesModel.countDocuments(query)
        ]);

        res.status(200).json({
            message: 'all credit sales',
            body: list,
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        });
    }catch(err){
        res.status(400).json({ message: err.message });
    }
});

// get by id
router.get('/credits/:_id', verifyToken, async (req,res)=>{
    try{
        const id = req.params._id;
        const item = await creditSalesModel.findById(id);
        if(!item){
            return res.status(404).json({ message:'not found' });
        }
        res.status(200).json({ message:'found', body: item });
    }catch(err){
        res.status(500).json({ message:'server error', error: err.message });
    }
});

// update
router.patch('/credits/:_id', verifyToken, requireRoles('manager', 'sale-agent'), async (req,res)=>{
    try{
        const id=req.params._id;
        const body = req.body;
        
        // Find existing record to compare tonnage
        const oldRecord = await creditSalesModel.findById(id);
        if(!oldRecord){
            return res.status(404).json({ message:'not found' });
        }

        // Calculate tonnage difference
        const tonnageDiff = parseFloat(body.tonnage || oldRecord.tonnage) - oldRecord.tonnage;
        
        // If tonnage increased, check if we have enough stock
        if (tonnageDiff > 0) {
            // Use case-insensitive lookup for stock record consistency
            const key = { 
                produceName: { $regex: new RegExp(`^${oldRecord.produceName}$`, 'i') }, 
                produceType: { $regex: new RegExp(`^${oldRecord.produceType}$`, 'i') }, 
                branch: oldRecord.branch 
            };
            const stock = await stockModel.findOne(key);
            if (!stock || stock.tonnage < tonnageDiff) {
                return res.status(400).json({ message: `Insufficient stock to increase tonnage. Available: ${stock?.tonnage || 0}kg` });
            }
        }

        const updated = await creditSalesModel.findByIdAndUpdate(id, body, { new:true });
        
        // Adjust stock and procurement
        if (tonnageDiff !== 0) {
            const key = { produceName: updated.produceName, produceType: updated.produceType, branch: updated.branch };
            await stockModel.updateOne(key, { $inc: { tonnage: -tonnageDiff } });
            await procurementModel.updateOne(key, { $inc: { tonnage: -tonnageDiff } });
        }

        res.status(200).json({ message:'updated', body: updated });
    }catch(err){
        res.status(500).json({ message:'server error', error: err.message });
    }
});

// delete
router.delete('/credits/:_id', verifyToken, requireRoles('manager', 'sale-agent'), async (req,res)=>{
    try{
        const id=req.params._id;
        const deleted = await creditSalesModel.findByIdAndDelete(id);
        if(!deleted){
            return res.status(404).json({ message:'not found' });
        }
        // Restock
        const key = { produceName: deleted.produceName, produceType: deleted.produceType, branch: deleted.branch };
        await stockModel.updateOne(key, { $inc: { tonnage: deleted.tonnage } });
        await procurementModel.updateOne(key, { $inc: { tonnage: deleted.tonnage } });

        res.status(200).json({ message:'deleted', body: deleted });
    }catch(err){
        res.status(500).json({ message:'server error', error: err.message });
    }
});

module.exports = { router };
