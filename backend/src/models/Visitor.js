const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  purpose: { type: String, required: true },
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flatNumber: { type: String, required: true },
  photoUrl: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  entryTime: { type: Date, default: Date.now },
  exitTime: { type: Date },
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = visitorSchema;
