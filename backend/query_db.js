const mongoose = require('mongoose');
const dotenv = require('dotenv');
const UserSchema = require('./src/models/User');
const TenantSchema = require('./src/models/Tenant');

dotenv.config();

const queryDB = async () => {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(`${process.env.MONGODB_URI}/ssms_master`, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to ssms_master');

    const User = mongoose.model('User', UserSchema);
    const Tenant = mongoose.model('Tenant', TenantSchema);

    // List all Super Admins
    const superAdmins = await User.find({ role: 'Super_Admin' });
    console.log('\n[Super Admins]');
    if (superAdmins.length === 0) console.log('None found.');
    superAdmins.forEach(u => console.log(`- Email: ${u.email}, Name: ${u.name}`));

    // List all Tenants
    const tenants = await Tenant.find({});
    console.log('\n[Tenants / Societies]');
    if (tenants.length === 0) console.log('None found.');
    
    for (const t of tenants) {
      console.log(`\nSociety: ${t.name} (ID: ${t.tenantId})`);
      const dbName = `ssms_tenant_${t.tenantId}`;
      const tenantDb = mongoose.connection.useDb(dbName, { useCache: true });
      const TenantUser = tenantDb.model('User', UserSchema);
      
      const users = await TenantUser.find({});
      users.forEach(u => console.log(`  - [${u.role}] ${u.email} (${u.name}) status: ${u.status}`));
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Query Error:', error.message);
    process.exit(1);
  }
};

queryDB();
