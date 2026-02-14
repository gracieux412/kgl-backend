const express = require('express');
const { salesModel } = require('../models/sales.model.js');
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
router.post("/sales", async (req, res) => {
    try {
        const body = req.body
        const sale = await salesModel.create(body)

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

router.get("/sales", async (req, res) => {
    try {
        const sale = await salesModel.find()
        res.status(200).json({
            message: "all sales",
            body: sale
        })
    } catch (err) {
        res.status(400).json({ message: err })
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

router.get("/sales/:_id", async(req, res)=>{
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

router.delete("/sales/:_id", async (req, res) => {
    try {
        const id = req.params._id;

        const sale = await salesModel.findByIdAndDelete(id);

        if (!sale) {
            return res.status(404).json({
                message: "sale not found"
            });
        }

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

router.patch("/sales/:_id", async (req, res) => {
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