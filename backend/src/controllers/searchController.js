const ComplaintSchema = require('../models/Complaint');
const UserSchema = require('../models/User');
const VisitorSchema = require('../models/Visitor');
const BillSchema = require('../models/Bill');

// @desc    Global search across records
// @route   GET /api/search
// @access  Private
const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ users: [], complaints: [], visitors: [], bills: [] });

    const regex = new RegExp(q, 'i');
    
    const Complaint = req.tenantDb.model('Complaint', ComplaintSchema);
    const User = req.tenantDb.model('User', UserSchema);
    const Visitor = req.tenantDb.model('Visitor', VisitorSchema);
    const Bill = req.tenantDb.model('Bill', BillSchema);

    const isResident = req.user.role === 'Resident';
    
    const userQuery = { $or: [{ name: regex }, { email: regex }, { flatNumber: regex }, { serviceType: regex }] };
    if (isResident) {
       // Residents can search themselves OR vendors
       userQuery._id = { $in: [req.user.userId, ...(await User.find({ role: 'Vendor' }).distinct('_id'))] };
    }
    
    const users = await User.find(userQuery).limit(5).select('name role flatNumber email');

    const complaintQuery = { $or: [{ category: regex }, { description: regex }, { location: regex }] };
    if (isResident) complaintQuery.resident = req.user.userId;
    const complaints = await Complaint.find(complaintQuery).limit(5).select('category description status');

    const visitorQuery = { name: regex };
    if (isResident) visitorQuery.resident = req.user.userId;
    const visitors = await Visitor.find(visitorQuery).limit(5).select('name status entryTime purpose');

    const billQuery = { description: regex };
    if (isResident) billQuery.resident = req.user.userId;
    const bills = await Bill.find(billQuery).limit(5).select('description amount status month');

    res.json({ users, complaints, visitors, bills });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { globalSearch };
