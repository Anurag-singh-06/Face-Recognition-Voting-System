const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    faceEncoding: {
        type: [Number],  // 128-d face encoding array
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter',
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    // hasVoted: {
    //     type: Boolean,
    //     default: false
    // },
    // votedFor: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Candidate',
    //     default: null
    // },
    // votedParty: {
    //     type: String,
    //     default: null
    // },
    otp: {
        type: String,
        default: null
    },
    otpExpiry: {
        type: Date,
        default: null
    },
      votes: [{
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election'
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate'
    },
    party: String,
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  votedInElections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election'
}]
}, {
    timestamps: true
});

// Pre-save hook to hash password if modified
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    // Prevent double hashing: check if already a bcrypt hash
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
