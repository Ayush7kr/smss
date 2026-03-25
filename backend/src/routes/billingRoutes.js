const express = require('express');
const router = express.Router();
const { getBills, createBill, payBill } = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');

router.use(protect, tenantMiddleware);

router.route('/')
  .get(getBills)
  .post(authorize('Society_Admin', 'Super_Admin'), createBill);

router.route('/:id/pay')
  .put(authorize('Resident', 'Society_Admin'), payBill);

module.exports = router;
