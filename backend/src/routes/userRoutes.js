const express = require('express');
const router = express.Router();
const { getPendingUsers, updateUserStatus, getResidents, getVendors } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');

router.get('/pending', protect, tenantMiddleware, getPendingUsers);
router.get('/residents', protect, tenantMiddleware, getResidents);
router.get('/vendors', protect, tenantMiddleware, getVendors);
router.put('/:id/status', protect, tenantMiddleware, updateUserStatus);

module.exports = router;
