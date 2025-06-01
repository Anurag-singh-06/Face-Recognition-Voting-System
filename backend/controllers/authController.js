const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register user
exports.register = async (req, res) => {
    try {
        const { name, email, phoneNumber, password, dateOfBirth, faceImage } = req.body;
        console.log('Registration attempt with data:', req.body);
        console.log('Registration password (plain):', password);

        // Validate required fields
        if (!name || !email || !phoneNumber || !password || !dateOfBirth || !faceImage) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        // Validate phone number format
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({
                message: 'Please enter a valid 10-digit Indian phone number'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User with this email already exists'
            });
        }

        // Check age
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            return res.status(400).json({ message: 'You must be at least 18 years old to register' });
        }

        // Get face encoding from Python service
        const axios = require('axios');
        let faceEncoding = null;
        try {
            const response = await axios.post('http://localhost:5001/encode-face', { image: faceImage }, { headers: { 'Content-Type': 'application/json' } });
            faceEncoding = response.data.encoding;
        } catch (err) {
            console.error('Error getting face encoding from Python service:', err.response ? err.response.data : err.message);
            return res.status(400).json({ message: 'Face encoding failed: ' + (err.response ? err.response.data.reason : err.message) });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        const { sendOTPEmail } = require('../utils/mailer');

        // Create new user
        const user = new User({
            name,
            email,
            phoneNumber,
            password, // plain password, let pre-save hook hash it
            dateOfBirth,
            faceEncoding,
            isVerified: false, // Set to false until OTP is verified
            otp,
            otpExpiry
        });

        await user.save();

        // Send OTP email
        await sendOTPEmail(email, otp);

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: 'Registration successful! Please verify your email with the OTP sent.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        console.error('Full error:', error);

        // Handle duplicate key errors
        if (error.code === 11000) {
            if (error.message.includes('phoneNumber')) {
                return res.status(400).json({ 
                    message: 'This phone number is already registered. Please use a different phone number.'
                });
            } else if (error.message.includes('email')) {
                return res.status(400).json({ 
                    message: 'This email is already registered. Please use a different email address.'
                });
            }
        }
        
        res.status(500).json({ message: 'Error registering user. Please try again.' });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP has expired
        if (user.otpExpires && user.otpExpires < new Date()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        }

        // Mark user as verified and remove OTP
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Email verified successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt with:', { email, password });

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('Found user:', email, 'Attempting password comparison');
        // Log stored hash for debugging
        console.log('Stored hash for user:', user.password);
        // Use the User model's comparePassword method
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Password mismatch for user:', email, 'Received password:', password);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log('Password matched for user:', email);

        // Generate token with JWT secret from env
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log('Login successful for user:', email);
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
};

// Admin login
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Admin login attempt:', { email });

        // Find admin user
        const admin = await User.findOne({ email });
        console.log('Found user:', admin ? { email: admin.email, role: admin.role } : 'No user found');
        
        if (!admin || admin.role !== 'admin') {
            return res.status(401).json({ message: 'Invalid credentials or unauthorized access' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
            console.log('Password mismatch for admin:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: admin._id,
                role: admin.role,
                isAdmin: true
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                isAdmin: true
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
};
