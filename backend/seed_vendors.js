const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/ssms_tenant_GVALLEY';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Super_Admin', 'Society_Admin', 'Resident', 'Security_Guard', 'Vendor'], default: 'Resident' },
  tenantId: String,
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  phone: String,
  serviceType: String // For Vendors (Plumber, Electrician, etc.)
});

const User = mongoose.model('User', UserSchema);

const seedVendors = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to GVALLEY tenant DB');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const vendors = [
      {
        name: 'John Plumber',
        email: 'john.plumber@example.com',
        password: hashedPassword,
        role: 'Vendor',
        tenantId: 'GVALLEY',
        status: 'Approved',
        phone: '1234567890',
        serviceType: 'Plumbing'
      },
      {
        name: 'Sparky Electrician',
        email: 'sparky@example.com',
        password: hashedPassword,
        role: 'Vendor',
        tenantId: 'GVALLEY',
        status: 'Approved',
        phone: '9876543210',
        serviceType: 'Electrical'
      },
      {
        name: 'Mighty Maintenance',
        email: 'mighty@example.com',
        password: hashedPassword,
        role: 'Vendor',
        tenantId: 'GVALLEY',
        status: 'Approved',
        phone: '5551234567',
        serviceType: 'Maintenance'
      }
    ];

    for (const v of vendors) {
      await User.findOneAndUpdate({ email: v.email }, v, { upsert: true, new: true });
      console.log(`Seeded vendor: ${v.name}`);
    }

    console.log('All test vendors seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding vendors:', err);
    process.exit(1);
  }
};

seedVendors();
