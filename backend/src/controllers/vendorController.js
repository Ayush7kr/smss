const UserSchema = require('../models/User');

// @desc    Get all vendors in the tenant
// @route   GET /api/vendors
// @access  Private (Society_Admin, Resident)
const getVendors = async (req, res) => {
  try {
    const User = req.tenantDb.models.User || req.tenantDb.model('User', UserSchema);
    
    // Vendors are users with role Vendor
    const vendors = await User.find({ role: 'Vendor' }).select('-password');

    res.json(vendors);
  } catch (error) {
    console.error('getVendors Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all vendors with performance metrics sorted by rating
// @route   GET /api/vendors/performance
// @access  Private (Society_Admin)
const getVendorPerformance = async (req, res) => {
  try {
    const User = req.tenantDb.models.User || req.tenantDb.model('User', UserSchema);
    const vendors = await User.find({ role: 'Vendor' })
        .select('name email phone serviceType totalTasksAssigned completedOnTime completedLate failedTasks rating profileImage')
        .sort({ rating: -1 });

    res.json(vendors);
  } catch (error) {
    console.error('getVendorPerformance Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getVendors, getVendorPerformance };
