const express = require('express');
const { salesModel } = require('../models/sales.model.js');
const { stockModel } = require('../models/stock.model.js');
const { procurementModel } = require('../models/procurement.model.js');
const { verifyToken, requireRoles } = require('../middleware/auth.midleware.js');
const router = express.Router()

/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sale'
 *     responses:
 *       201:
 *         description: Sale created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 body:
 *                   $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Failed to create sale
 */
// create a sale api
router.post("/sales", verifyToken, requireRoles("manager", "sale-agent"), async (req, res) => {
    try {
        const body = req.body
        if (body.saleType && body.saleType !== "cash") {
            return res.status(400).json({ message: "use credit sales endpoint for credit sales" })
        }
        const key = { 
            produceName: body.produceName, 
            produceType: body.produceType, 
            branch: body.branch 
        }
        const stock = await stockModel.findOne(key)
        if (!stock || stock.tonnage < body.tonnage) {
            return res.status(400).json({ message: "insufficient stock" })
        }
        const sale = await salesModel.create({ ...body, saleType: "cash" })
        await stockModel.updateOne(key, { $inc: { tonnage: -body.tonnage } })
        await procurementModel.updateOne(key, { $inc: { tonnage: -body.tonnage } })

        res.status(201).json({
            message: "sale created successfully",
            body: sale
        })


    } catch (err) {
        res.status(400).json({ message: "failed to create a sale" })
    }
})

/**
 * @swagger
 * /sales:
 *   get:
 *     summary: Get all sales
 *     tags: [Sales]
 *     responses:
 *       200:
 *         description: List of all sales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 body:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Failed to fetch sales
 */
// get all sale

router.get("/sales", verifyToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, search, startDate, endDate, produceType } = req.query;
        const query = {};

        // Role-based filtering
        if (req.user.role === 'manager' || req.user.role === 'sale-agent') {
            query.branch = req.user.branch;
        } else if (req.query.branch) {
            query.branch = req.query.branch;
        }

        // Search filter (produceName)
        if (search) {
            query.produceName = { $regex: search, $options: 'i' };
        }

        // Produce type filter
        if (produceType) {
            query.produceType = produceType;
        }

        // Date range filter
        if (startDate || endDate) {
            query.dateAndTime = {};
            if (startDate) query.dateAndTime.$gte = new Date(startDate);
            if (endDate) query.dateAndTime.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [sales, totalItems] = await Promise.all([
            salesModel.find(query).sort({ dateAndTime: -1 }).skip(skip).limit(parseInt(limit)),
            salesModel.countDocuments(query)
        ]);

        res.status(200).json({
            message: "all sales",
            body: sales,
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (err) {
        res.status(400).json({ message: "failed to fetch sales" })
    }
});

/**
 * @swagger
 * /sales/{_id}:
 *   get:
 *     summary: Get a sale by ID
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 body:
 *                   $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Sale not found
 *       500:
 *         description: Server error
 */
//get sales by id

router.get("/sales/:_id", verifyToken, async(req, res)=>{
    try{
        let id = req.params._id
        const sale = await salesModel.findById(id)

        if(!sale){
            return res.status(404).json({
            message: "sale not found",
        });
        }

         res.status(200).json({
            message: "sale found",
            body: sale
        })

    }catch(err){
        res.status(500).json({
            message: "An error occured",
            error: err.message
        });
    }
})


/**
 * @swagger
 * /sales/{_id}:
 *   delete:
 *     summary: Delete a sale by ID
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale deleted successfully
 *       404:
 *         description: Sale not found
 *       500:
 *         description: Server error
 */
// router for deleting sales

router.delete("/sales/:_id", verifyToken, requireRoles("manager", "sale-agent"), async (req, res) => {
    try {
        const id = req.params._id;

        const sale = await salesModel.findByIdAndDelete(id);

        if (!sale) {
            return res.status(404).json({
                message: "sale not found"
            });
        }

        // Restock
        const key = { 
            produceName: sale.produceName, 
            produceType: sale.produceType, 
            branch: sale.branch 
        };
        await stockModel.updateOne(key, { $inc: { tonnage: sale.tonnage } });
        await procurementModel.updateOne(key, { $inc: { tonnage: sale.tonnage } });

        res.status(200).json({
            message: "sale deleted successfully",
            data: sale
        });

    } catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
});

// the router handler for patch api

/**
 * @swagger
 * /sales/{_id}:
 *   patch:
 *     summary: Update a sale by ID
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sale'
 *     responses:
 *       200:
 *         description: Sale updated successfully
 *       404:
 *         description: Sale not found
 *       500:
 *         description: Server error
 */

router.patch("/sales/:_id", verifyToken, requireRoles("manager", "sale-agent"), async (req, res) => {
    try {
        let id = req.params._id;
        let updateUser = await salesModel.findByIdAndUpdate(id, req.body, { new: true })

        if (!updateUser) {
            return res.status(404).json({
                message: "sale not find"
            })
        }
        res.status(200).json({
            message: "sale updated successfully",
            body: updateUser
        })

    } catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
})


module.exports = { router }
