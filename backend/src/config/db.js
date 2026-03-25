const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // We connect to the master database that holds all tenants and super admin data
    const conn = await mongoose.connect(`${process.env.MONGODB_URI}/ssms_master`);
    console.log(`MongoDB Connected (Master): ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const getTenantDB = (tenantId) => {
  if (!tenantId) {
    throw new Error('Please provide tenantId');
  }
  // This uses a separate database per tenant
  const dbName = `ssms_tenant_${tenantId}`;
  return mongoose.connection.useDb(dbName, { useCache: true });
};

module.exports = { connectDB, getTenantDB };
