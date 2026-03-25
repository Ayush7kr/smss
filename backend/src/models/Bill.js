const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  month: { type: String, required: true }, // e.g. "January 2025"
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Overdue'], 
    default: 'Pending' 
  },
  lateFee: { type: Number, default: 0 },
  paymentDate: { type: Date },
  paymentMethod: { type: String }
}, { timestamps: true });

module.exports = billSchema;
