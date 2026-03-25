const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Apply protect and tenantMiddleware for profile
router.get('/profile', protect, tenantMiddleware, getUserProfile);

module.exports = router;
