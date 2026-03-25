const mongoose = require('mongoose');
const UserSchema = require('../models/User');

// @desc    Get all pending users for approval
// @route   GET /api/users/pending
// @access  Private (Society Admin only)
const getPendingUsers = async (req, res) => {
  try {
    if (req.user.role !== 'Society_Admin') {
      return res.status(403).json({ message: 'Not authorized as Society Admin' });
    }

    const User = req.tenantDb.models.User || req.tenantDb.model('User', UserSchema);
    const users = await User.find({ status: 'Pending' }).select('-password').sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (error) {
    console.error('Fetch Pending Users Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all approved residents
// @route   GET /api/users/residents
// @access  Private
const getResidents = async (req, res) => {
  try {
    const User = req.tenantDb.model('User', UserSchema);
    const residents = await User.find({ role: 'Resident', status: 'Approved' }).select('-password').sort({ name: 1 });
    res.json(residents);
  } catch (error) {
    console.error('Fetch Residents Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user status (Approve/Reject)
// @route   PUT /api/users/:id/status
// @access  Private (Society Admin only)
const updateUserStatus = async (req, res) => {
  try {
    if (req.user.role !== 'Society_Admin') {
      return res.status(403).json({ message: 'Not authorized as Society Admin' });
    }

    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const User = req.tenantDb.models.User || req.tenantDb.model('User', UserSchema);
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status
    });
  } catch (error) {
    console.error('Update User Status Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all approved vendors
// @route   GET /api/users/vendors
// @access  Private
const getVendors = async (req, res) => {
  try {
    const User = req.tenantDb.models.User || req.tenantDb.model('User', UserSchema);
    const vendors = await User.find({ role: 'Vendor', status: 'Approved' }).select('-password').sort({ name: 1 });
    res.json(vendors);
  } catch (error) {
    console.error('Fetch Vendors Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPendingUsers,
  updateUserStatus,
  getResidents,
  getVendors,
};
