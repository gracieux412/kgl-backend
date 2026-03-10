const { userModel } = require('../models/users.model');
const { branchModel } = require('../models/branch.model');
const { logModel } = require('../models/log.model');
const { procurementModel } = require('../models/procurement.model');
const { salesModel } = require('../models/sales.model');
const { stockModel } = require('../models/stock.model');
const bcrypt = require('bcrypt');

// User CRUD operations
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find().select('-password');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, email, password, role, branch } = req.body;

        // Validate required fields
        if (!username || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email or username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new userModel({
            username,
            email,
            password: hashedPassword,
            role,
            branch: role === 'director' || role === 'admin' ? undefined : branch
        });

        await newUser.save();

        // Log the action
        await logModel.create({
            action: 'CREATE_USER',
            user: req.user.id,
            details: `Created user ${username} with role ${role}`,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { ...newUser.toObject(), password: undefined }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { username, email, role, branch } = req.body;
        const userId = req.params.id;

        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (branch !== undefined) updateData.branch = branch;

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Log the action
        await logModel.create({
            action: 'UPDATE_USER',
            user: req.user.id,
            details: `Updated user ${updatedUser.username}`,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(200).json({ success: true, message: 'User updated successfully', data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Don't allow deleting admin users
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Cannot delete admin user' });
        }

        await userModel.findByIdAndDelete(userId);

        // Log the action
        await logModel.create({
            action: 'DELETE_USER',
            user: req.user.id,
            details: `Deleted user ${user.username}`,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting user', error: error.message });
    }
};

// Branch CRUD operations
const getAllBranches = async (req, res) => {
    try {
        const branches = await branchModel.find().populate('manager', 'username email');
        res.status(200).json({ success: true, data: branches });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching branches', error: error.message });
    }
};

const createBranch = async (req, res) => {
    try {
        const { name, location } = req.body;

        if (!name || !location) {
            return res.status(400).json({ success: false, message: 'Name and location are required' });
        }

        const newBranch = new branchModel({ name, location });
        await newBranch.save();

        // Log the action
        await logModel.create({
            action: 'CREATE_BRANCH',
            user: req.user.id,
            details: `Created branch ${name}`,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(201).json({ success: true, message: 'Branch created successfully', data: newBranch });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating branch', error: error.message });
    }
};

const updateBranch = async (req, res) => {
    try {
        const { name, location, manager } = req.body;
        const branchId = req.params.id;

        const updateData = {};
        if (name) updateData.name = name;
        if (location) updateData.location = location;
        if (manager !== undefined) updateData.manager = manager;
        updateData.updatedAt = new Date();

        const updatedBranch = await branchModel.findByIdAndUpdate(
            branchId,
            updateData,
            { new: true }
        ).populate('manager', 'username email');

        if (!updatedBranch) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }

        // Log the action
        await logModel.create({
            action: 'UPDATE_BRANCH',
            user: req.user.id,
            details: `Updated branch ${updatedBranch.name}`,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(200).json({ success: true, message: 'Branch updated successfully', data: updatedBranch });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating branch', error: error.message });
    }
};

const deleteBranch = async (req, res) => {
    try {
        const branchId = req.params.id;

        const deletedBranch = await branchModel.findByIdAndDelete(branchId);

        if (!deletedBranch) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }

        // Log the action
        await logModel.create({
            action: 'DELETE_BRANCH',
            user: req.user.id,
            details: `Deleted branch ${deletedBranch.name}`,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(200).json({ success: true, message: 'Branch deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting branch', error: error.message });
    }
};

// Logs operations
const getAllLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const logs = await logModel.find()
            .populate('user', 'username email role')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        const total = await logModel.countDocuments();

        res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching logs', error: error.message });
    }
};

const deleteLog = async (req, res) => {
    try {
        const logId = req.params.id;
        const deletedLog = await logModel.findByIdAndDelete(logId);

        if (!deletedLog) {
            return res.status(404).json({ success: false, message: 'Log not found' });
        }

        res.status(200).json({ success: true, message: 'Log deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting log', error: error.message });
    }
};

const clearAllLogs = async (req, res) => {
    try {
        await logModel.deleteMany({});
        
        // Log this major action
        await logModel.create({
            action: 'CLEAR_LOGS',
            user: req.user.id,
            details: 'Administrator cleared all system logs',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(200).json({ success: true, message: 'All logs cleared successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error clearing logs', error: error.message });
    }
};

const getUserCount = async (req, res) => {
    try {
        const count = await userModel.countDocuments();
        res.status(200).json({ success: true, data: { count } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching user count', error: error.message });
    }
};

const getBranchCount = async (req, res) => {
    try {
        const count = await branchModel.countDocuments();
        res.status(200).json({ success: true, data: { count } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching branch count', error: error.message });
    }
};

const getProcurementCount = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'manager') {
            query.branch = req.user.branch;
        }
        const count = await procurementModel.countDocuments(query);
        res.status(200).json({ success: true, data: { count } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching procurement count', error: error.message });
    }
};

const getSalesCount = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'manager') {
            query.branch = req.user.branch;
        }
        const count = await salesModel.countDocuments(query);
        res.status(200).json({ success: true, data: { count } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching sales count', error: error.message });
    }
};

const getCreditCount = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'manager') {
            query.branch = req.user.branch;
        }
        const count = await require('../models/creditSales.model').creditSalesModel.countDocuments(query);
        res.status(200).json({ success: true, data: { count } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching credit count', error: error.message });
    }
};

const getStockCount = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'manager') {
            query.branch = req.user.branch;
        }
        const count = await stockModel.countDocuments(query);
        res.status(200).json({ success: true, data: { count } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching stock count', error: error.message });
    }
};

const getDashboardOverview = async (req, res) => {
    try {
        // Build query based on role
        let branchQuery = {};
        if (req.user.role === 'manager') {
            branchQuery.branch = req.user.branch;
        }

        // Get counts
        const totalSales = await salesModel.countDocuments(branchQuery);
        const totalProcurement = await procurementModel.countDocuments(branchQuery);
        const totalStock = await stockModel.countDocuments(branchQuery);
        
        // Get aggregated sales data
        const salesData = await salesModel.find(branchQuery);
        const totalSalesAmount = salesData.reduce((sum, sale) => sum + (sale.amountPaid || 0), 0);
        
        // Get aggregated procurement data
        const procurementData = await procurementModel.find(branchQuery);
        const totalProcurementCost = procurementData.reduce((sum, proc) => sum + (proc.cost || 0), 0);
        
        // Calculate outstanding credit: include real credit sales model and any credit-type sales
        let outstandingCredit = 0;
        try {
            const creditQuery = { ...branchQuery };
            const creditList = await require('../models/creditSales.model').creditSalesModel.find(creditQuery);
            outstandingCredit += creditList.reduce((sum, c) => sum + (c.amountDue || 0), 0);
        } catch (e) {
            // ignore if model unavailable
        }
        // also include any legacy credit entries in salesData
        const legacyCredit = salesData.filter(s => s.saleType === 'credit');
        outstandingCredit += legacyCredit.reduce((sum, sale) => sum + (sale.amountPaid || 0), 0);
        
        // Calculate average agent performance
        const agentSales = {};
        salesData.forEach(sale => {
            const agentName = sale.salesAgentName;
            if (!agentSales[agentName]) agentSales[agentName] = 0;
            agentSales[agentName]++;
        });
        const agentPerformances = Object.values(agentSales).map(count => (count / Math.max(1, totalSales)) * 100);
        const averageAgentPerformance = agentPerformances.length > 0 
            ? agentPerformances.reduce((a, b) => a + b, 0) / agentPerformances.length 
            : 0;

        res.status(200).json({
            success: true,
            data: {
                totalSales,
                totalProcurement,
                totalStock,
                totalSalesAmount,
                totalProcurementCost,
                outstandingCredit,
                averageAgentPerformance
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching overview', error: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    getAllLogs,
    deleteLog,
    clearAllLogs,
    getUserCount,
    getBranchCount,
    getProcurementCount,
    getSalesCount,
    getStockCount,
    getCreditCount,
    getDashboardOverview
};