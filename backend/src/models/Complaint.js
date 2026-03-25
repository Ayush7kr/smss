const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  imageUrl: { type: String },
  assignedVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date },
  dueDate: { type: Date },
  completionDate: { type: Date },
  isOverdue: { type: Boolean, default: false },
  escalationCount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Pending', 'Assigned', 'In Progress', 'Completed', 'Verified', 'Escalated', 'Reassigned', 'Resolved', 'Rejected by Vendor'], 
    default: 'Pending' 
  },
  resolutionNotes: { type: String }
}, { timestamps: true });

module.exports = complaintSchema;
