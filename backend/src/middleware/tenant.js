const { getTenantDB } = require('../config/db');
const mongoose = require('mongoose');

// Map to hold loaded tenant models to prevent overwriting
const tenantModels = {};

const tenantMiddleware = async (req, res, next) => {
  try {
    // 1. Get tenantId from decoded JWT (req.user set by auth middleware)
    // For some routes (like login), it might come from req.body
    let tenantId = req.user?.tenantId || req.body?.tenantId || req.headers['x-tenant-id'];

    if (!tenantId) {
       // Super admin doesn't need a specific tenant DB for platform level actions, 
       // but for this middleware we expect a tenantId for tenant specific routes
       if (req.user && req.user.role === 'Super_Admin') {
           return next(); // Super admin bypass for master routes
       }
       return res.status(400).json({ message: 'Tenant ID is missing' });
    }

    // 2. Switch DB Connection
    const tenantDb = getTenantDB(tenantId);
    
    // 3. Attach DB connection to request so controllers can use it
    req.tenantDb = tenantDb;
    req.tenantId = tenantId;

    next();
  } catch (error) {
    console.error('Tenant Middleware Error:', error);
    res.status(500).json({ message: 'Error processing tenant information' });
  }
};

module.exports = { tenantMiddleware };
