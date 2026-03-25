const ComplaintSchema = require('../models/Complaint');
const VisitorSchema = require('../models/Visitor');
const UserSchema = require('../models/User');
const BillSchema = require('../models/Bill');

// @desc    Get dashboard statistics for the tenant
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const Complaint = req.tenantDb.model('Complaint', ComplaintSchema);
    const Visitor = req.tenantDb.model('Visitor', VisitorSchema);
    const User = req.tenantDb.model('User', UserSchema);
    const Bill = req.tenantDb.model('Bill', BillSchema);

    // Common stats
    const totalResidents = await User.countDocuments({ role: 'Resident' });
    const pendingComplaints = await Complaint.countDocuments({ status: 'Pending' });
    
    // Depending on the role, we might send different stats, but for now
    // we return a comprehensive set of statistics and let the frontend filter
    if (req.user.role === 'Society_Admin' || req.user.role === 'Super_Admin') {
       const today = new Date();
       today.setHours(0,0,0,0);

       const todaysVisitors = await Visitor.countDocuments({ entryTime: { $gte: today } });
       
       const totalBillsPaid = await Bill.countDocuments({ status: 'Paid' });
       const totalBillsPending = await Bill.countDocuments({ status: 'Pending' });

       // Additional aggregated stats for charts
       const complaintsByCategory = await Complaint.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } }
       ]);

       return res.json({
           totalResidents,
           pendingComplaints,
           todaysVisitors,
           totalBillsPaid,
           totalBillsPending,
           complaintsByCategory
       });
    }

    if (req.user.role === 'Resident') {
       const myComplaints = await Complaint.countDocuments({ resident: req.user.userId });
       const myPendingBills = await Bill.countDocuments({ resident: req.user.userId, status: 'Pending' });
       
       const recentComplaints = await Complaint.find({ resident: req.user.userId })
           .sort({ createdAt: -1 })
           .limit(3);

       const today = new Date();
       today.setHours(0,0,0,0);
       const upcomingVisitors = await Visitor.find({ 
           resident: req.user.userId,
           $or: [{ status: 'Pending' }, { status: 'Approved' }],
           entryTime: { $gte: today }
       }).sort({ entryTime: 1 }).limit(3);
       
       return res.json({
           totalResidents,
           pendingComplaints,
           myComplaints,
           myPendingBills,
           recentComplaints,
           upcomingVisitors
       });
    }

    res.json({ message: 'Role stats not specifically defined, returning defaults', totalResidents, pendingComplaints });

  } catch (error) {
    console.error('getDashboardStats Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getDashboardStats };
