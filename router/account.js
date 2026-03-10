const express = require('express');
const bcrypt = require('bcrypt');
const { userModel } = require('../models/users.model.js');
const { verifyToken } = require('../middleware/auth.midleware.js');
const router = express.Router()

router.patch("/me/password", verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body || {}
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "currentPassword and newPassword are required" })
        }
        const user = await userModel.findOne({ email: req.user.email })
        if (!user) return res.status(404).json({ message: "user not found" })
            
        const ok = await bcrypt.compare(currentPassword, user.password)
        if (!ok) return res.status(400).json({ message: "current password is incorrect" })
        const hashed = await bcrypt.hash(newPassword, 10)
        user.password = hashed
        await user.save()
        res.status(200).json({ message: "password updated successfully" })
    } catch (err) {
        res.status(500).json({ message: "Server error" })
    }
})

module.exports = { router }
