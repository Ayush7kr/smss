const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const UserSchema = require('./src/models/User');
const TenantSchema = require('./src/models/Tenant');

dotenv.config();

const checkUsers = async () => {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(`${process.env.MONGODB_URI}/ssms_master`);
    console.log('Connected to ssms_master');

    const User = mongoose.model('User', UserSchema);
    const Tenant = mongoose.model('Tenant', TenantSchema);

    const superAdmins = await User.find({ role: 'Super_Admin' });
    console.log('\n--- Super Admins ---');
    superAdmins.forEach(u => console.log(`ID: ${u._id}, Email: ${u.email}, Name: ${u.name}, Status: ${u.status}`));

    const tenants = await Tenant.find({});
    console.log('\n--- Societies (Tenants) ---');
    for (const t of tenants) {
      console.log(`\nSociety: ${t.name} (ID: ${t.tenantId}), Status: ${t.status}`);
      
      const dbName = `ssms_tenant_${t.tenantId}`;
      const tenantDb = mongoose.connection.useDb(dbName, { useCache: true });
      const TenantUser = tenantDb.model('User', UserSchema);
      
      const users = await TenantUser.find({});
      users.forEach(u => console.log(`  - Role: ${u.role}, Email: ${u.email}, Name: ${u.name}, Status: ${u.status}`));
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUsers();
