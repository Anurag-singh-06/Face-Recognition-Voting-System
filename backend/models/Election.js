const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  parties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',  // Assuming parties are candidates or linked to candidates
    required: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Election', electionSchema);
