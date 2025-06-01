const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    partyName: {
        type: String,
        required: true,
        trim: true
    },
    partySymbol: {
        type: String,  // URL or Base64 of the party symbol image
        required: true
    },
    votes: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Candidate', candidateSchema);
