const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Super_Admin', 'Society_Admin', 'Resident', 'Security_Guard', 'Vendor'],
    required: true
  },
  tenantId: { type: String }, // Null for super admins
  flatNumber: { type: String }, // For residents
  phone: { type: String },
  profileImage: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  serviceType: { type: String }, // For vendors (e.g. Plumber, Electrician)
  // Vendor performance metrics
  totalTasksAssigned: { type: Number, default: 0 },
  activeTasks: { type: Number, default: 0 },
  completedOnTime: { type: Number, default: 0 },
  completedLate: { type: Number, default: 0 },
  failedTasks: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = userSchema;
