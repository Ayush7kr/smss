const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const UserSchema = require('./backend/src/models/User');
    const MasterUser = mongoose.connection.model('User', UserSchema);
    
    const users = await MasterUser.find({ role: 'Vendor' }).lean();
    console.log("Master DB Vendors:", JSON.stringify(users, null, 2));

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
