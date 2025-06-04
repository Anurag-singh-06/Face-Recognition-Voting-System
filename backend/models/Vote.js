const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  verificationMethod: {
    type: String,
    enum: ['face', 'otp', 'fingerprint'],
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'verified'
  },
  ipAddress: String,
  deviceInfo: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
voteSchema.index({ voter: 1, election: 1 }, { unique: true });
voteSchema.index({ election: 1, party: 1 });

// Virtual population
voteSchema.virtual('voterDetails', {
  ref: 'User',
  localField: 'voter',
  foreignField: '_id',
  justOne: true
});

voteSchema.virtual('electionDetails', {
  ref: 'Election',
  localField: 'election',
  foreignField: '_id',
  justOne: true
});

voteSchema.virtual('partyDetails', {
  ref: 'Party',
  localField: 'party',
  foreignField: '_id',
  justOne: true
});

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;