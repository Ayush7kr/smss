const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const UserSchema = require('./src/models/User');
const TenantSchema = require('./src/models/Tenant');

dotenv.config();

const seed = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(`${MONGODB_URI}/ssms_master`, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to ssms_master');

    const UserMaster = mongoose.model('User', UserSchema);
    const Tenant = mongoose.model('Tenant', TenantSchema);

    // 1. Create Super Admin
    const superAdminEmail = 'superadmin@ssms.com';
    const existingSuperAdmin = await UserMaster.findOne({ email: superAdminEmail });
    if (!existingSuperAdmin) {
      await UserMaster.create({
        name: 'Super Admin',
        email: superAdminEmail,
        password: 'password123',
        role: 'Super_Admin',
        status: 'Approved'
      });
      console.log('Super Admin created: superadmin@ssms.com / password123');
    } else {
      console.log('Super Admin already exists.');
    }

    // 2. Create a Tenant (Society)
    const tenantId = 'SOC123';
    let tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      tenant = await Tenant.create({
        name: 'Green View Society',
        tenantId,
        status: 'Approved'
      });
      console.log('Tenant created: Green View Society (SOC123)');
    } else {
      tenant.status = 'Approved';
      await tenant.save();
      console.log('Tenant SOC123 already exists (marked Approved).');
    }

    // 3. Create Users for the Tenant
    const tenantDb = mongoose.connection.useDb(`ssms_tenant_${tenantId}`, { useCache: true });
    const UserTenant = tenantDb.model('User', UserSchema);

    const usersToCreate = [
      { name: 'Society Admin User', email: 'admin@soc123.com', password: 'password123', role: 'Society_Admin', tenantId, status: 'Approved' },
      { name: 'Resident User', email: 'resident@soc123.com', password: 'password123', role: 'Resident', tenantId, flatNumber: 'A-101', status: 'Approved' },
      { name: 'Security Guard User', email: 'guard@soc123.com', password: 'password123', role: 'Security_Guard', tenantId, status: 'Approved' },
      { name: 'Vendor User', email: 'vendor@soc123.com', password: 'password123', role: 'Vendor', tenantId, status: 'Approved', serviceType: 'Plumbing & Maintenance' }
    ];

    for (const userData of usersToCreate) {
      const existingUser = await UserTenant.findOne({ email: userData.email });
      if (!existingUser) {
        await UserTenant.create(userData);
        console.log(`${userData.role} created: ${userData.email} / password123`);
      } else {
        existingUser.status = 'Approved';
        await existingUser.save();
        console.log(`${userData.role} already exists (marked Approved).`);
      }
    }

    console.log('\n--- Demo Data Summary ---');
    console.log('Super Admin:  superadmin@ssms.com / password123');
    console.log('Society Admin: admin@soc123.com    / password123 (ID: SOC123)');
    console.log('Resident:      resident@soc123.com / password123 (ID: SOC123)');
    console.log('Guard:         guard@soc123.com    / password123 (ID: SOC123)');
    console.log('Vendor:        vendor@soc123.com   / password123 (ID: SOC123)');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error.message);
    process.exit(1);
  }
};

seed();
