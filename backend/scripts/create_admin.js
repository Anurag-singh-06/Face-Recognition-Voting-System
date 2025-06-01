require('dotenv').config({ path: __dirname + '/../.env' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = process.env.MONGODB_URI;
console.log('Connecting to MongoDB:', MONGO_URI);

async function createAdmin() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const email = 'abhik2059@gmail.com';
  const password = 'abhik2059';
  const hashedPassword = await bcrypt.hash(password, 10);
  const adminExists = await User.findOne({ email });
  if (adminExists) {
    adminExists.password = hashedPassword;
    adminExists.role = 'admin';
    adminExists.isAdmin = true;
    await adminExists.save();
    console.log('Admin user updated.');
  } else {
    const admin = new User({
      name: 'Admin',
      email,
      phoneNumber: '9999999999',
      password: hashedPassword,
      dateOfBirth: new Date('1990-01-01'),
      faceEncoding: Array(128).fill(0), // Dummy encoding, update later if needed
      role: 'admin',
      isAdmin: true
    });
    await admin.save();
    console.log('Admin user created.');
  }
  await mongoose.disconnect();
}

createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
