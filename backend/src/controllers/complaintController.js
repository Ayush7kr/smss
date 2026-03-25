const mongoose = require('mongoose');
const { getTenantDB } = require('../config/db');
const ComplaintSchema = require('../models/Complaint');
const UserSchema = require('../models/User');
const NotificationSchema = require('../models/Notification');
const { getIo } = require('../config/socket');

const calculateRating = (user) => {
  if (user.totalTasksAssigned === 0) return 0;
  return (user.completedOnTime / user.totalTasksAssigned) * 5;
};

const getPopulatedComplaint = async (tenantDb, id) => {
    const Complaint = tenantDb.models.Complaint || tenantDb.model('Complaint', ComplaintSchema);
    tenantDb.models.User || tenantDb.model('User', UserSchema);
    return await Complaint.findById(id)
        .populate('resident', 'name flatNumber')
        .populate('assignedVendorId', 'name phone rating');
};

const getComplaints = async (req, res) => {
  try {
    const Complaint = req.tenantDb.models.Complaint || req.tenantDb.model('Complaint', ComplaintSchema);
    req.tenantDb.models.User || req.tenantDb.model('User', UserSchema);
    let query = {};
    if (req.user.role === 'Resident') query.resident = req.user.userId;
    else if (req.user.role === 'Vendor') query.assignedVendorId = req.user.userId;

    const complaints = await Complaint.find(query)
        .populate('resident', 'name flatNumber')
        .populate('assignedVendorId', 'name phone rating')
        .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error('getComplaints Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const createComplaint = async (req, res) => {
  try {
    if (req.user.role !== 'Resident') {
      return res.status(403).json({ message: 'Only residents can submit complaints' });
    }
    const { category, description, location, priority, imageUrl } = req.body;
    const Complaint = req.tenantDb.models.Complaint || req.tenantDb.model('Complaint', ComplaintSchema);
    const complaint = await Complaint.create({
      resident: req.user.userId,
      category, description, location, priority, imageUrl, status: 'Pending'
    });
    
    const populated = await getPopulatedComplaint(req.tenantDb, complaint._id);
    res.status(201).json(populated);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const assignComplaint = async (req, res) => {
  try {
    const { vendorId, dueDate } = req.body;
    if (!vendorId || !dueDate) return res.status(400).json({ message: 'vendorId and dueDate are required' });
    const Complaint = req.tenantDb.models.Complaint || req.tenantDb.model('Complaint', ComplaintSchema);
    const User = req.tenantDb.models.User || req.tenantDb.model('User', UserSchema);
    
    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    
    complaint.assignedVendorId = vendorId;
    complaint.dueDate = new Date(dueDate);
    complaint.assignedAt = new Date();
    complaint.status = 'Assigned';
    await complaint.save();

    await User.findByIdAndUpdate(vendorId, { $inc: { totalTasksAssigned: 1 } });
    
    // Notify Vendor & Resident
    const Notification = req.tenantDb.model('Notification', NotificationSchema);
    const vendorNotif = await Notification.create({
      recipient: vendorId,
      title: 'New Task Assigned',
      message: `You have been assigned a ${complaint.category} task. Due: ${new Date(dueDate).toLocaleDateString()}`,
      type: 'Complaint',
      relatedId: complaint._id
    });
    const residentNotif = await Notification.create({
      recipient: complaint.resident,
      title: 'Vendor Assigned',
      message: `A vendor has been assigned to your complaint.`,
      type: 'Complaint',
      relatedId: complaint._id
    });

    try {
      getIo().to(vendorId.toString()).emit('new_notification', vendorNotif);
      getIo().to(complaint.resident.toString()).emit('new_notification', residentNotif);
    } catch (e) { /* silent fail */ }

    const populated = await getPopulatedComplaint(req.tenantDb, complaint._id);
    res.json(populated);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const startComplaint = async (req, res) => {
  try {
    const Complaint = req.tenantDb.models.Complaint || req.tenantDb.model('Complaint', ComplaintSchema);
    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    if (req.user.role === 'Vendor' && req.user.userId !== complaint.assignedVendorId.toString()) return res.status(403).json({ message: 'Unauthorized' });
    
    complaint.status = 'In Progress';
    await complaint.save();
    
    const populated = await getPopulatedComplaint(req.tenantDb, complaint._id);
    res.json(populated);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const completeComplaint = async (req, res) => {
  try {
    const { resolutionNotes } = req.body;
    const Complaint = req.tenantDb.models.Complaint || req.tenantDb.model('Complaint', ComplaintSchema);
    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    if (req.user.role === 'Vendor' && req.user.userId !== complaint.assignedVendorId.toString()) return res.status(403).json({ message: 'Unauthorized' });
    
    complaint.status = 'Resolved'; // Auto-resolve instead of 'Completed' to remove Resident approval step
    complaint.completionDate = new Date();
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
    await complaint.save();

    // Credit Vendor
    const User = req.tenantDb.models.User || req.tenantDb.model('User', UserSchema);
    let vendor = await User.findById(complaint.assignedVendorId);
    if (vendor) {
        const onTime = complaint.completionDate <= complaint.dueDate;
        vendor[onTime ? 'completedOnTime' : 'completedLate'] += 1;
        vendor.rating = calculateRating(vendor);
        await vendor.save();
    }
    
    // Notify Resident
    const Notification = req.tenantDb.model('Notification', NotificationSchema);
    const residentNotif = await Notification.create({
      recipient: complaint.resident,
      title: 'Complaint Resolved',
      message: `Your complaint has been resolved by the vendor. Notes: ${resolutionNotes || 'None'}`,
      type: 'Complaint',
      relatedId: complaint._id
    });
    try {
      getIo().to(complaint.resident.toString()).emit('new_notification', residentNotif);
    } catch(e) {}

    const populated = await getPopulatedComplaint(req.tenantDb, complaint._id);
    res.json(populated);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const verifyComplaint = async (req, res) => {
  try {
    const { accept } = req.body;
    const Complaint = req.tenantDb.models.Complaint || req.tenantDb.model('Complaint', ComplaintSchema);
    
    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    if (req.user.role === 'Resident' && req.user.userId !== complaint.resident.toString()) return res.status(403).json({ message: 'Unauthorized' });
    
    if (accept) {
       complaint.status = 'Verified';
       const onTime = complaint.completionDate <= complaint.dueDate;
       
    const User = req.tenantDb.models.User || req.tenantDb.model('User', UserSchema);
    let vendor = await User.findById(complaint.assignedVendorId);
    if (vendor) {
        vendor[onTime ? 'completedOnTime' : 'completedLate'] += 1;
        vendor.rating = calculateRating(vendor);
        await vendor.save();
    }
  } else {
     complaint.status = 'Reassigned';
  }
  await complaint.save();
  
  const populated = await getPopulatedComplaint(req.tenantDb, complaint._id);
  res.json(populated);
} catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const escalateComplaint = async (req, res) => {
try {
  const Complaint = req.tenantDb.models.Complaint || req.tenantDb.model('Complaint', ComplaintSchema);
  const User = req.tenantDb.models.User || req.tenantDb.model('User', UserSchema);

  let complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Not found' });
  
  complaint.status = 'Escalated';
  complaint.isOverdue = true;
  complaint.escalationCount += 1;
  await complaint.save();
  
  let vendor = await User.findById(complaint.assignedVendorId);
    if (vendor) {
        vendor.failedTasks += 1;
        vendor.rating = calculateRating(vendor);
        await vendor.save();
    }
    
    const populated = await getPopulatedComplaint(req.tenantDb, complaint._id);
    res.json(populated);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const reassignComplaint = async (req, res) => {
  try {
    const { vendorId, dueDate } = req.body;
    const Complaint = req.tenantDb.models.Complaint || req.tenantDb.model('Complaint', ComplaintSchema);
    const User = req.tenantDb.models.User || req.tenantDb.model('User', UserSchema);
    
    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    
    if (complaint.assignedVendorId && complaint.status !== 'Escalated') {
       let vendor = await User.findById(complaint.assignedVendorId);
       if (vendor) {
           vendor.failedTasks += 1;
           vendor.rating = calculateRating(vendor);
           await vendor.save();
       }
    }
    
    complaint.assignedVendorId = vendorId;
    complaint.dueDate = new Date(dueDate);
    complaint.assignedAt = new Date();
    complaint.status = 'Reassigned';
    await complaint.save();
    
    let nextVendor = await User.findById(vendorId);
    if (nextVendor) {
       nextVendor.totalTasksAssigned += 1;
       nextVendor.rating = calculateRating(nextVendor);
       await nextVendor.save();
    }

    // Notify New Vendor & Resident
    const Notification = req.tenantDb.model('Notification', NotificationSchema);
    const vendorNotif = await Notification.create({
      recipient: vendorId,
      title: 'New Task Reassigned',
      message: `You have been assigned a reassigned ${complaint.category} task.`,
      type: 'Complaint',
      relatedId: complaint._id
    });
    const residentNotif = await Notification.create({
      recipient: complaint.resident,
      title: 'Vendor Reassigned',
      message: `A new vendor (${nextVendor?.name || 'Assigned'}) has been assigned to your complaint.`,
      type: 'Complaint',
      relatedId: complaint._id
    });
    try {
      getIo().to(vendorId.toString()).emit('new_notification', vendorNotif);
      getIo().to(complaint.resident.toString()).emit('new_notification', residentNotif);
    } catch(e) {}

    const populated = await getPopulatedComplaint(req.tenantDb, complaint._id);
    res.json(populated);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const rejectComplaint = async (req, res) => {
  try {
    const { reason } = req.body;
    const Complaint = req.tenantDb.models.Complaint || req.tenantDb.model('Complaint', ComplaintSchema);
    const User = req.tenantDb.models.User || req.tenantDb.model('User', UserSchema);
    
    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    
    // Ensure Vendor is the assignee
    if (req.user.role === 'Vendor' && req.user.userId !== complaint.assignedVendorId.toString()) {
       return res.status(403).json({ message: 'Unauthorized' });
    }

    complaint.status = 'Rejected by Vendor';
    complaint.resolutionNotes = reason || 'No reason provided by vendor.';
    await complaint.save();

    // Notify Resident
    const Notification = req.tenantDb.model('Notification', NotificationSchema);
    const residentNotif = await Notification.create({
      recipient: complaint.resident,
      title: 'Task Rejected by Vendor',
      message: `The assigned vendor rejected your task. Reason: ${complaint.resolutionNotes}`,
      type: 'Complaint',
      relatedId: complaint._id
    });
    try {
      getIo().to(complaint.resident.toString()).emit('new_notification', residentNotif);
    } catch(e) {}
    
    const populated = await getPopulatedComplaint(req.tenantDb, complaint._id);
    res.json(populated);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

module.exports = { getComplaints, createComplaint, assignComplaint, startComplaint, completeComplaint, verifyComplaint, escalateComplaint, reassignComplaint, rejectComplaint };
