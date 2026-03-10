const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');

// Import middleware
const { verifyToken, requireRoles } = require('../middleware/auth.midleware');

// User routes
router.get('/users', verifyToken, requireRoles('admin'), getAllUsers);
router.get('/users/:id', verifyToken, requireRoles('admin'), getUserById);
router.post('/users', verifyToken, requireRoles('admin'), createUser);
router.put('/users/:id', verifyToken, requireRoles('admin'), updateUser);
router.delete('/users/:id', verifyToken, requireRoles('admin'), deleteUser);

// Branch routes
router.get('/branches', verifyToken, requireRoles('admin', 'director'), getAllBranches);
router.post('/branches', verifyToken, requireRoles('admin'), createBranch);
router.put('/branches/:id', verifyToken, requireRoles('admin'), updateBranch);
router.delete('/branches/:id', verifyToken, requireRoles('admin'), deleteBranch);

// Logs routes
router.get('/logs', verifyToken, requireRoles('admin'), getAllLogs);
router.delete('/logs/:id', verifyToken, requireRoles('admin'), deleteLog);
router.delete('/logs', verifyToken, requireRoles('admin'), clearAllLogs);

// Stats routes
router.get('/stats/users/count', verifyToken, requireRoles('admin', 'manager'), getUserCount);
router.get('/stats/branches/count', verifyToken, requireRoles('admin'), getBranchCount);
router.get('/stats/procurements/count', verifyToken, requireRoles('admin', 'manager'), getProcurementCount);
router.get('/stats/sales/count', verifyToken, requireRoles('admin', 'manager'), getSalesCount);
router.get('/stats/stock/count', verifyToken, requireRoles('admin', 'manager'), getStockCount);
router.get('/stats/credits/count', verifyToken, requireRoles('admin', 'manager'), getCreditCount);
router.get('/stats/overview', verifyToken, requireRoles('admin', 'manager', 'director'), getDashboardOverview);

module.exports = { router };