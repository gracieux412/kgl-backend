const express = require('express');
const { userModel } = require('../models/users.model');
const router = express.Router()


// create a user api
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 body:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Failed to create user
 */
router.post("/users", async (req, res) => {
    try {
        const body = req.body
        const user = await userModel.create(body)

        res.status(201).json({
            message: "user created successfully",
            body: user
        })


    } catch (err) {
        res.status(400).json({ message: "failed to create a user" })
    }
})

// get all user

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
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
 *                     $ref: '#/components/schemas/User'
 *       400:
 *         description: Failed to fetch users
 */

router.get("/users", async (req, res) => {
    try {
        const user = await userModel.find()
        res.status(200).json({
            message: "all users",
            body: user
        })
    } catch (err) {
        res.status(400).json({ message: err })
    }
});


//get users by id

/**
 * @swagger
 * /users/{_id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 body:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.get("/users/:_id", async(req, res)=>{
    try{
        let id = req.params._id
        const user = await userModel.findById(id)

        if(!user){
            return res.status(404).json({
            message: "user not found",
        });
        }

         res.status(200).json({
            message: "user found",
            body: user
        })

    }catch(err){
        res.status(500).json({
            message: "An error occured",
            error: err.message
        });
    }
})

// router for deleting users

/**
 * @swagger
 * /users/{_id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.delete("/users/:_id", async (req, res) => {
    try {
        const id = req.params._id;

        const user = await userModel.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User deleted successfully",
            data: user
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
 * /users/{_id}:
 *   patch:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.patch("/users/:_id", async (req, res) => {
    try {
        let id = req.params._id;
        let updateUser = await userModel.findByIdAndUpdate(id, req.body, { new: true })

        if (!updateUser) {
            return res.status(404).json({
                message: "user not find"
            })
        }
        res.status(200).json({
            message: "user updated successfully",
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