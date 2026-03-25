const express = require('express');
const router = express.Router();
const { getNotices, createNotice, deleteNotice } = require('../controllers/noticeController');
const { protect } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');

// All endpoints require auth and tenant isolation
router.use(protect);
router.use(tenantMiddleware);

router.route('/')
  .get(getNotices)
  .post(createNotice);

router.route('/:id')
  .delete(deleteNotice);

module.exports = router;
