const mongoose = require('mongoose');
const cron = require('node-cron');
const TenantSchema = require('../models/Tenant');
const ComplaintSchema = require('../models/Complaint');
const UserSchema = require('../models/User');
const NotificationSchema = require('../models/Notification');
const { getTenantDB } = require('../config/db');
const { getIo } = require('../config/socket');

const calculateRating = (user) => {
  if (user.totalTasksAssigned === 0) return 0;
  return (user.completedOnTime / user.totalTasksAssigned) * 5;
};

const escalateOverdueTasks = async () => {
  console.log('[Cron] Checking for overdue complaints across all tenants...');
  try {
    // If Tenant is already compiled on mongoose, this is fine. If not, mongoose will compile it globally.
    // Ensure we don't compile it multiple times:
    const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);
    const tenants = await Tenant.find({ status: 'Approved' });
    
    for (const tenant of tenants) {
      const tenantDb = getTenantDB(tenant.tenantId);
      const Complaint = tenantDb.model('Complaint', ComplaintSchema);
      const User = tenantDb.model('User', UserSchema);

      const overdueComplaints = await Complaint.find({
        dueDate: { $lt: new Date() },
        status: { $in: ['Assigned', 'In Progress'] }
      });

      for (const complaint of overdueComplaints) {
        complaint.status = 'Escalated';
        complaint.isOverdue = true;
        complaint.escalationCount += 1;
        await complaint.save();

        if (complaint.assignedVendorId) {
          let vendor = await User.findById(complaint.assignedVendorId);
          if (vendor) {
            vendor.failedTasks += 1;
            vendor.rating = calculateRating(vendor);
            await vendor.save();

            const Notification = tenantDb.model('Notification', NotificationSchema);
            const vendorNotif = await Notification.create({
              recipient: vendor._id,
              title: 'Task Overdue Escalation',
              message: `Your task for ${complaint.category} has passed the deadline and is escalated.`,
              type: 'Reminder',
              relatedId: complaint._id
            });
            try {
              getIo().to(vendor._id.toString()).emit('new_notification', vendorNotif);
            } catch(e) { /* silent fail if disconnected */ }
          }
        }
      }
      if (overdueComplaints.length > 0) {
         console.log(`[Cron] Escalated ${overdueComplaints.length} task(s) in tenant ${tenant.tenantId}`);
      }
    }
  } catch (error) {
    console.error('[Cron] error executing escalateOverdueTasks:', error);
  }
};

const initCronJobs = () => {
  // Run every hour
  cron.schedule('0 * * * *', escalateOverdueTasks);
  console.log('Cron jobs initialized: Overdue Task Escalation');
  
  // Optionally run once on startup for quick testing/sync
  // escalateOverdueTasks();
};

module.exports = { initCronJobs };
