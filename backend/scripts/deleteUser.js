require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function deleteUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await User.deleteOne({ email: 'abhik2059@gmail.com' });
        
        if (result.deletedCount > 0) {
            console.log('User deleted successfully');
        } else {
            console.log('User not found');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error deleting user:', error);
        process.exit(1);
    }
}

deleteUser();
