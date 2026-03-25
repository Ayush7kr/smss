const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const UserSchema = require('./src/models/User');
    const MasterUser = mongoose.connection.model('User', UserSchema);
    
    const users = await MasterUser.find({ role: 'Vendor' }).lean();
    console.log("Master DB Vendors:");
    console.dir(users, { depth: null });

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
