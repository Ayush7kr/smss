const mongoose = require('mongoose');

// Tenant Schema is saved in the MASTER DB
const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tenantId: { type: String, required: true, unique: true },
  address: { type: String },
  subscriptionStatus: { type: String, enum: ['active', 'inactive', 'trial'], default: 'trial' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

// We only export the schema so it can be compiled with the right connection
module.exports = tenantSchema;
