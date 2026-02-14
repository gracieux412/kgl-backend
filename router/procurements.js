const express = require('express');
const { procurementModel } = require('../models/procurement.model.js');
const router = express.Router()


// create a procurement api



/**
 * @swagger
 * /api/procurements:
 *   post:
 *     summary: Create a new procurement
 *     description: Creates a new procurement record in the system.
 *     tags:
 *       - Procurements
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplierName
 *               - itemName
 *               - quantity
 *               - unitPrice
 *               - procurementDate
 *             properties:
 *               supplierName:
 *                 type: string
 *                 example: "Kampala Fresh Supplies"
 *               itemName:
 *                 type: string
 *                 example: "Sugar 50kg"
 *               quantity:
 *                 type: number
 *                 example: 20
 *               unitPrice:
 *                 type: number
 *                 example: 120000
 *               totalAmount:
 *                 type: number
 *                 example: 2400000
 *               procurementDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-14"
 *               status:
 *                 type: string
 *                 enum: [pending, approved, delivered]
 *                 example: "pending"
 *     responses:
 *       201:
 *         description: Procurement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: procurement created successfully
 *                 body:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "65cbd123abc4567890"
 *                     supplierName:
 *                       type: string
 *                     itemName:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unitPrice:
 *                       type: number
 *                     totalAmount:
 *                       type: number
 *                     procurementDate:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Failed to create procurement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: failed to create a procurement
 */
router.post("/procurements", async (req, res) => {
    try {
        const body = req.body
        const procurement = await procurementModel.create(body)

        res.status(201).json({
            message: "procurement created successfully",
            body: procurement
        })
    } catch (err) {
        res.status(400).json({ message: "failed to create a procurement" })
    }
})


/**
 * @swagger
 * /api/procurements:
 *   get:
 *     summary: Get all procurements
 *     description: Retrieves a list of all procurement records.
 *     tags:
 *       - Procurements
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of procurements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: all procurements
 *                 body:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Procurement'
 *       400:
 *         description: Failed to retrieve procurements
 */

// get all procurement

router.get("/procurements", async (req, res) => {
    try {
        const procurement = await procurementModel.find()
        res.status(200).json({
            message: "all procurements",
            body: procurement
        })
    } catch (err) {
        res.status(400).json({ message: err })
    }
});


/**
 * @swagger
 * /api/procurements/{_id}:
 *   get:
 *     summary: Get procurement by ID
 *     description: Retrieves a specific procurement using its ID.
 *     tags:
 *       - Procurements
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: The procurement ID
 *         example: 65cbd123abc4567890
 *     responses:
 *       200:
 *         description: Procurement found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: procurement found
 *                 body:
 *                   $ref: '#/components/schemas/Procurement'
 *       404:
 *         description: Procurement not found
 *       500:
 *         description: Server error
 */


//get procurements by id

router.get("/procurements/:_id", async(req, res)=>{
    try{
        let id = req.params._id
        const procurement = await procurementModel.findById(id)

        if(!procurement){
            return res.status(404).json({
            message: "procurement not found",
        });
        }

         res.status(200).json({
            message: "procurement found",
            body: procurement
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
 * /api/procurements/{_id}:
 *   delete:
 *     summary: Delete a procurement
 *     description: Deletes a procurement by its ID.
 *     tags:
 *       - Procurements
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: The procurement ID
 *         example: 65cbd123abc4567890
 *     responses:
 *       200:
 *         description: Procurement deleted successfully
 *       404:
 *         description: Procurement not found
 *       500:
 *         description: Server error
 */

// router for deleting procurements

router.delete("/procurements/:_id", async (req, res) => {
    try {
        const id = req.params._id;

        const procurement = await procurementModel.findByIdAndDelete(id);

        if (!procurement) {
            return res.status(404).json({
                message: "procurement not found"
            });
        }

        res.status(200).json({
            message: "procurement deleted successfully",
            data: procurement
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
 * /api/procurements/{_id}:
 *   patch:
 *     summary: Update a procurement
 *     description: Updates selected fields of a procurement.
 *     tags:
 *       - Procurements
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: The procurement ID
 *         example: 65cbd123abc4567890
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               supplierName:
 *                 type: string
 *               itemName:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unitPrice:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [pending, approved, delivered]
 *     responses:
 *       200:
 *         description: Procurement updated successfully
 *       404:
 *         description: Procurement not found
 *       500:
 *         description: Server error
 */


router.patch("/procurements/:_id", async (req, res) => {
    try {
        let id = req.params._id;
        let updateUser = await procurementModel.findByIdAndUpdate(id, req.body, { new: true })

        if (!updateUser) {
            return res.status(404).json({
                message: "procurement not find"
            })
        }
        res.status(200).json({
            message: "procurement updated successfully",
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