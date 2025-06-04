const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        // Get token from header
        let token;
        
        if (
            req.headers.authorization && 
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ 
                message: 'Not authorized, no token provided' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from token
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ 
                message: 'Not authorized, user not found' 
            });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Authentication error:', err.message);
        res.status(401).json({ 
            message: 'Not authorized, token failed' 
        });
    }
};

exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            message: 'Not authorized as admin' 
        });
    }
};

exports.verifiedVoter = (req, res, next) => {
    if (req.user && req.user.role === 'voter' && req.user.isVerified) {
        next();
    } else {
        res.status(403).json({ 
            message: 'Not authorized as verified voter' 
        });
    }
};