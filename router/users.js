const express = require('express');
const { userModel } = require('../models/users.model');
const bcrypt = require("bcrypt");
const { verifyToken, requireRoles } = require('../middleware/auth.midleware.js');
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
router.post("/users", verifyToken, requireRoles("admin"), async (req, res) => {
    try {
        const body = req.body
        if (!body.password) {
            return res.status(400).json({ message: "password is required" })
        }
        const hashed = await bcrypt.hash(body.password, 10);
        body.password = hashed;
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

router.get("/users", verifyToken, requireRoles("admin"), async (req, res) => {
    try {
        const { page = 1, limit = 10, search, role, branch } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) query.role = role;
        if (branch) query.branch = branch;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [users, totalItems] = await Promise.all([
            userModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            userModel.countDocuments(query)
        ]);

        res.status(200).json({
            message: "all users",
            body: users,
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (err) {
        res.status(400).json({ message: "failed to fetch users" })
    }
});


router.get("/users/me", verifyToken, async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({
            message: "current user",
            body: user
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
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

router.get("/users/:_id", verifyToken, requireRoles("admin"), async(req, res)=>{
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

router.delete("/users/:_id", verifyToken, requireRoles("admin"), async (req, res) => {
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

router.patch("/users/:_id", verifyToken, requireRoles("admin"), async (req, res) => {
    try {
        let id = req.params._id;
        const update = { ...req.body };
        if (update.password) {
            update.password = await bcrypt.hash(update.password, 10);
        }
        let updateUser = await userModel.findByIdAndUpdate(id, update, { new: true })

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
