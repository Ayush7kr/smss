const express = require('express');
const router = express.Router();
const { getComplaints, createComplaint, updateComplaint } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');

// All complaint routes are protected and tenant specific
router.use(protect, tenantMiddleware);

router.route('/')
  .get(getComplaints)
  .post(authorize('Resident'), createComplaint);

router.route('/:id')
  .put(authorize('Society_Admin', 'Super_Admin', 'Vendor'), updateComplaint);

module.exports = router;
