const UserSchema = require('../models/User');

// @desc    Get all vendors in the tenant
// @route   GET /api/vendors
// @access  Private (Society_Admin, Resident)
const getVendors = async (req, res) => {
  try {
    const User = req.tenantDb.model('User', UserSchema);
    
    // Vendors are users with role Vendor
    const vendors = await User.find({ role: 'Vendor' }).select('-password');

    res.json(vendors);
  } catch (error) {
    console.error('getVendors Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getVendors };
