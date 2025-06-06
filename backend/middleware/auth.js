const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from token
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'Token is not valid' });
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

exports.verifiedVoter = (req, res, next) => {
    if (req.user && req.user.role === 'voter' && req.user.isVerified) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Verified voters only.' });
    }
};
