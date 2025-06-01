require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function updateAdminPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const hashedPassword = await bcrypt.hash('abhik2059', 10);
        
        const result = await User.updateOne(
            { email: 'abhik2059@gmail.com' },
            { $set: { password: hashedPassword } }
        );

        if (result.modifiedCount > 0) {
            console.log('Admin password updated successfully');
        } else {
            console.log('Admin user not found or password not changed');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error updating admin password:', error);
        process.exit(1);
    }
}

updateAdminPassword();
