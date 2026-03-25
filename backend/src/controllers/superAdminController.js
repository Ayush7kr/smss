const mongoose = require('mongoose');
const TenantSchema = require('../models/Tenant');
const UserSchema = require('../models/User');

const Tenant = mongoose.model('Tenant', TenantSchema);
const BillSchema = require('../models/Bill');

const getSuperAdminStats = async (req, res) => {
  try {
    const tenants = await Tenant.find({ status: 'Approved' });
    let activeUsers = 0;
    let revenue = 0;

    for (const t of tenants) {
      const dbName = `ssms_tenant_${t.tenantId}`;
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      const TenantUser = db.model('User', UserSchema);
      const Bill = db.model('Bill', BillSchema);
      
      activeUsers += await TenantUser.countDocuments({ status: 'Approved' });
      
      const paidBills = await Bill.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      if (paidBills.length > 0) {
        revenue += paidBills[0].total;
      }
    }

    res.json({
      societies: tenants.length,
      activeUsers,
      revenue
    });
  } catch (error) {
    console.error('getSuperAdminStats error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all societies (Tenants) pending approval
// @route   GET /api/superadmin/pending-societies
// @access  Private/Super_Admin
// @desc    Get all approved societies (Tenants)
// @route   GET /api/superadmin/societies
// @access  Private/Super_Admin
const getSocieties = async (req, res) => {
  try {
    const societies = await Tenant.find({ status: 'Approved' }).sort({ createdAt: -1 });
    res.json(societies);
  } catch (error) {
    console.error('Error fetching societies:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getPendingSocieties = async (req, res) => {
  try {
    // Fetch all societies that are either Pending OR Approved (we'll filter Approved ones later)
    const societies = await Tenant.find({
       status: { $in: ['Pending', 'Approved'] }
    }).sort({ createdAt: -1 });
    
    const pendingApprovals = [];
    for (const society of societies) {
       try {
         const dbName = `ssms_tenant_${society.tenantId}`;
         const dbToUse = mongoose.connection.useDb(dbName, { useCache: true });
         const TenantUser = dbToUse.model('User', UserSchema);
         
         // Find if there's an admin and check their status
         const admin = await TenantUser.findOne({ role: 'Society_Admin' }).select('name email phone status');
         
         const isAdminPending = admin && admin.status === 'Pending';
         const isTenantPending = society.status === 'Pending';

         // If either tenant is pending OR there's a pending admin, include it
         if (isTenantPending || isAdminPending) {
            pendingApprovals.push({
               ...society.toObject(),
               admin: admin || null
            });
         }
       } catch (err) {
         console.error(`Error checking status for ${society.tenantId}:`, err);
         if (society.status === 'Pending') {
            pendingApprovals.push(society.toObject());
         }
       }
    }

    res.json(pendingApprovals);
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Approve a society
// @route   PUT /api/superadmin/societies/:tenantId/approve
// @access  Private/Super_Admin
const approveSociety = async (req, res) => {
  const { tenantId } = req.params;
  try {
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
       return res.status(404).json({ message: 'Society not found' });
    }
    
    // 1. Mark Tenant as Approved in Master DB if it was Pending
    if (tenant.status === 'Pending') {
       tenant.status = 'Approved';
       await tenant.save();
    }

    // 2. Connect to Tenant DB and mark Society_Admin(s) as Approved
    const dbName = `ssms_tenant_${tenantId}`;
    const dbToUse = mongoose.connection.useDb(dbName, { useCache: true });
    const TenantUser = dbToUse.model('User', UserSchema);

    // Find and approve any pending society admins
    const pendingAdmins = await TenantUser.find({ role: 'Society_Admin', status: 'Pending' });
    for (const admin of pendingAdmins) {
       admin.status = 'Approved';
       await admin.save();
    }

    res.json({ message: `Society ${tenantId} and its admins have been processed for approval.` });
  } catch (error) {
    console.error('Error approving society:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Reject a society
// @route   PUT /api/superadmin/societies/:tenantId/reject
// @access  Private/Super_Admin
const rejectSociety = async (req, res) => {
  const { tenantId } = req.params;
  try {
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
       return res.status(404).json({ message: 'Society not found' });
    }
    
    tenant.status = 'Rejected';
    await tenant.save();

    const dbName = `ssms_tenant_${tenantId}`;
    const dbToUse = mongoose.connection.useDb(dbName, { useCache: true });
    const TenantUser = dbToUse.model('User', UserSchema);

    const societyAdmins = await TenantUser.find({ role: 'Society_Admin' });
    for (const admin of societyAdmins) {
       admin.status = 'Rejected';
       await admin.save();
    }

    res.json({ message: `Society ${tenantId} registration rejected.` });
  } catch (error) {
    console.error('Error rejecting society:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new society (Tenant)
// @route   POST /api/superadmin/societies
// @access  Private/Super_Admin
const createSociety = async (req, res) => {
  let { name, tenantId, status } = req.body;
  try {
    // Auto-generate unique tenantId if not provided
    if (!tenantId) {
      const generateId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'SOC-';
        for (let i = 0; i < 6; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      let isUnique = false;
      while (!isUnique) {
        tenantId = generateId();
        const existing = await Tenant.findOne({ tenantId });
        if (!existing) isUnique = true;
      }
    }

    const tenantExists = await Tenant.findOne({ tenantId });
    if (tenantExists) {
      return res.status(400).json({ message: 'Tenant ID already exists' });
    }

    const tenant = await Tenant.create({
      name,
      tenantId,
      status: status || 'Pending'
    });

    res.status(201).json(tenant);
  } catch (error) {
    console.error('Error creating society:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getSocieties,
  getPendingSocieties,
  getSuperAdminStats,
  approveSociety,
  rejectSociety,
  createSociety
};
