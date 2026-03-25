const express = require('express');
const router = express.Router();
const { getVendors, getVendorPerformance } = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');

router.use(protect, tenantMiddleware);

router.get('/performance', getVendorPerformance);
router.route('/').get(getVendors);

module.exports = router;
