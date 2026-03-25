const jwt = require('jsonwebtoken');
const { generateToken } = require('../middleware/auth');
const mongoose = require('mongoose');
const { getTenantDB } = require('../config/db');
const UserSchema = require('../models/User'); // Import the schema, not the compiled model
const TenantSchema = require('../models/Tenant');

// Setup Master DB Models
const Tenant = mongoose.model('Tenant', TenantSchema);

// @desc    Register a new user (tenant admin or resident/guard/vendor depending on who calls it)
// @route   POST /api/auth/register
// @access  Public (for some roles) or Private
const registerUser = async (req, res) => {
  let { name, email, password, role, tenantId, flatNumber, phone, serviceType } = req.body;
  if (email) email = email.toLowerCase().trim();

  try {
    // 1. If not super admin, must have tenantId
    if (role !== 'Super_Admin' && !tenantId) {
      return res.status(400).json({ message: 'Tenant ID is required for this role.' });
    }

    // 2. Validate tenant exists if not super admin
    if (role !== 'Super_Admin') {
      let tenantExists = await Tenant.findOne({ tenantId });
      
      // Auto-create tenant for Society Admins if it doesn't exist
      if (!tenantExists && role === 'Society_Admin') {
         tenantExists = await Tenant.create({ name: `Society ${tenantId}`, tenantId });
      } else if (!tenantExists) {
         return res.status(400).json({ message: 'Invalid Tenant ID. The society does not exist.' });
      }
    }

    // 3. Select DB to save user
    let dbToUse = mongoose.connection; // Master DB default for Super_Admin
    if (role !== 'Super_Admin') {
      dbToUse = getTenantDB(tenantId);
    }

    // 4. Compile Model for that DB
    const User = dbToUse.model('User', UserSchema);

    // 5. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists in this tenant.' });
    }

    // 6. Create User. Super_Admin is auto-approved, others are Pending.
    const user = await User.create({
      name,
      email,
      password,
      role,
      tenantId: role === 'Super_Admin' ? null : tenantId,
      flatNumber,
      phone,
      serviceType, // Plumber, Electrician, etc.
      status: role === 'Super_Admin' ? 'Approved' : 'Pending'
    });

    if (user) {
      // If user is pending, do not log them in immediately.
      if (user.status === 'Pending') {
        const adminType = role === 'Society_Admin' ? 'Super Admin' : 'Society Admin';
        return res.status(201).json({
           message: `Registration successful! Please wait for ${adminType} approval before logging in.`,
           status: 'Pending'
        });
      }

      const token = generateToken(user._id, user.role, user.tenantId);
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  let { email, password, tenantId, role } = req.body;
  if (email) email = email.toLowerCase().trim();

  try {
    // Determine DB based on role provided in login form
    let dbToUse = mongoose.connection; // Master DB
    if (role !== 'Super_Admin') {
      if (!tenantId) {
        return res.status(400).json({ message: 'Tenant ID must be provided for login.' });
      }
      dbToUse = getTenantDB(tenantId);
    }

    // Compile Model
    const User = dbToUse.model('User', UserSchema);

    // Find User
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Validate requested role matches actual role
      if (user.role !== role) {
         return res.status(401).json({ message: 'Invalid login role for this user.' });
      }

      // Check approval status
      if (user.status === 'Pending') {
         return res.status(401).json({ message: 'Your account is still pending approval by the Society Admin.' });
      }
      if (user.status === 'Rejected') {
         return res.status(401).json({ message: 'Your account registration was rejected.' });
      }

      const token = generateToken(user._id, user.role, user.tenantId);
      
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    let dbToUse = mongoose.connection;
    if (req.user.role !== 'Super_Admin') {
      dbToUse = req.tenantDb; // Attached by tenant middleware
    }
    
    const User = dbToUse.model('User', UserSchema);
    const user = await User.findById(req.user.userId).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
};
