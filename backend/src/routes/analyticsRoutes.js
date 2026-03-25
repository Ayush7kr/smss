const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');

router.use(protect, tenantMiddleware);

router.route('/stats')
  .get(getDashboardStats);

module.exports = router;
