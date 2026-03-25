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
       const complaintStatusDistribution = await Complaint.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
       ]);

       // Advanced Metrics
       const resolvedComplaints = await Complaint.find({ status: { $in: ['Resolved', 'Verified', 'Completed'] }, completionDate: { $exists: true } });
       let totalResolutionTime = 0;
       resolvedComplaints.forEach(c => {
         totalResolutionTime += (new Date(c.completionDate) - new Date(c.createdAt));
       });
       const avgResolutionTimeDays = resolvedComplaints.length > 0 ? (totalResolutionTime / resolvedComplaints.length) / (1000 * 60 * 60 * 24) : 0;
       
       const completedComplaints = resolvedComplaints.length;
       const onTimeComplaints = await Complaint.countDocuments({ status: { $in: ['Resolved', 'Verified', 'Completed'] }, isOverdue: false });
       const percentOnTime = completedComplaints > 0 ? (onTimeComplaints / completedComplaints) * 100 : 0;

       const overdueComplaintsCount = await Complaint.countDocuments({ isOverdue: true, status: { $nin: ['Resolved', 'Verified'] } });
       const vendorPerformance = await User.find({ role: 'Vendor' }).select('name rating completedOnTime completedLate failedTasks totalTasksAssigned').limit(10);

       const sixMonthsAgo = new Date();
       sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
       const monthlyRevenue = await Bill.aggregate([
          { $match: { status: 'Paid', updatedAt: { $gte: sixMonthsAgo } } },
          { $group: { _id: { month: { $month: "$updatedAt" }, year: { $year: "$updatedAt" } }, revenue: { $sum: '$amount' } } },
          { $sort: { "_id.year": 1, "_id.month": 1 } }
       ]);

       const totalBillsGenerated = await Bill.countDocuments();
       const paymentSuccessRate = totalBillsGenerated > 0 ? (totalBillsPaid / totalBillsGenerated) * 100 : 0;

       // Activity Feed
       const recentUsers = await User.find({ role: 'Resident' }).sort({ createdAt: -1 }).limit(3).select('name flatNumber createdAt');
       const recentComplaintsDB = await Complaint.find().sort({ createdAt: -1 }).limit(3).select('category location createdAt');
       const recentVisitors = await Visitor.find({ status: 'Approved' }).sort({ createdAt: -1 }).limit(3).select('name resident createdAt');

       const activity = [
          ...recentUsers.map(u => ({ type: 'user', title: 'New Resident Onboarded', desc: `Flat ${u.flatNumber || 'N/A'}`, date: u.createdAt || new Date() })),
          ...recentComplaintsDB.map(c => ({ type: 'complaint', title: `${c.category || 'General'} issue raised`, desc: c.location || 'N/A', date: c.createdAt || new Date() })),
          ...recentVisitors.map(v => ({ type: 'visitor', title: 'Visitor Approved', desc: `${v.name || 'Guest'}`, date: v.createdAt || new Date() }))
       ];
       activity.sort((a, b) => b.date - a.date);
       const recentActivity = activity.slice(0, 5);

       return res.json({
           totalResidents,
           pendingComplaints,
           todaysVisitors,
           totalBillsPaid,
           totalBillsPending,
           complaintsByCategory,
           complaintStatusDistribution,
           recentActivity,
           avgResolutionTimeDays,
           percentOnTime,
           overdueComplaintsCount,
           vendorPerformance,
           monthlyRevenue,
           paymentSuccessRate
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
