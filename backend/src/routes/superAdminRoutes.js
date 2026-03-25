const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getSocieties, getPendingSocieties, approveSociety, rejectSociety, createSociety } = require('../controllers/superAdminController');

// All routes here are restricted to Super_Admin
router.use(protect);
router.use(authorize('Super_Admin'));

router.get('/societies', getSocieties);
router.get('/societies/pending', getPendingSocieties);
router.post('/societies', createSociety);
router.put('/societies/:tenantId/approve', approveSociety);
router.put('/societies/:tenantId/reject', rejectSociety);

module.exports = router;
