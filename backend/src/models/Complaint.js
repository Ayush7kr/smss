const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  imageUrl: { type: String },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['Pending', 'Assigned', 'In Progress', 'Resolved'], 
    default: 'Pending' 
  },
  resolutionNotes: { type: String }
}, { timestamps: true });

module.exports = complaintSchema;
