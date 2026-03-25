const express = require('express');
const router = express.Router();
const { 
  getComplaints, 
  createComplaint, 
  assignComplaint,
  startComplaint,
  completeComplaint,
  verifyComplaint,
  escalateComplaint,
  reassignComplaint,
  rejectComplaint
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');

// All complaint routes are protected and tenant specific
router.use(protect, tenantMiddleware);

router.route('/')
  .get(getComplaints)
  .post(authorize('Resident'), createComplaint);

// Using standard mapping for ease
router.put('/:id/assign', authorize('Society_Admin', 'Super_Admin'), assignComplaint);
router.put('/:id/start', authorize('Vendor'), startComplaint);
router.put('/:id/complete', authorize('Vendor'), completeComplaint);
router.put('/:id/verify', authorize('Resident', 'Society_Admin'), verifyComplaint);
router.put('/:id/escalate', authorize('Resident', 'Society_Admin'), escalateComplaint);
router.put('/:id/reassign', authorize('Society_Admin', 'Super_Admin'), reassignComplaint);
router.put('/:id/reject', authorize('Vendor'), rejectComplaint);

module.exports = router;
