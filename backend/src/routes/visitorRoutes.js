const express = require('express');
const router = express.Router();
const { getVisitors, createVisitor, updateVisitor } = require('../controllers/visitorController');
const { protect, authorize } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');

router.use(protect, tenantMiddleware);

router.route('/')
  .get(getVisitors)
  .post(authorize('Security_Guard'), createVisitor);

router.route('/:id')
  .put(authorize('Resident', 'Security_Guard'), updateVisitor);

module.exports = router;
