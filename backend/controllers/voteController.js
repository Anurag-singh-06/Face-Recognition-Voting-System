const User = require('../models/User');
const Candidate = require('../models/Candidate');

const axios = require('axios');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -otp -otpExpiry');
    res.json(users);
  } catch (error) {
    console.error('[getAllUsers] Error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};
// Verify voter's face
exports.verifyVoterFace = async (req, res) => {
    try {
        const { faceImage } = req.body;
        const voter = await User.findById(req.user.id);

        if (!voter) {
            return res.status(404).json({ message: 'Voter not found' });
        }

        // Compare the provided faceImage with the stored voter faceEncoding
        const payload = {
            encoding: voter.faceEncoding, // Registered face encoding
            image: faceImage              // Captured face (base64)
        };

        // Call the Python Flask service for encoding verification
        const response = await axios.post('http://localhost:5001/verify-encoding', payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.data.match) {
            res.json({ message: 'Face verified successfully', distance: response.data.distance });
        } else {
            res.status(401).json({ message: 'Face does not match', distance: response.data.distance });
        }
    } catch (error) {
        console.error('Face verification error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Error verifying face', details: error.response ? error.response.data : error.message });
    }
};

// Atomic face verification and vote
exports.verifyAndVote = async (req, res) => {
    try {
        const { faceImage, candidateId } = req.body;
        const voter = await User.findById(req.user.id);
        if (!voter) return res.status(404).json({ message: 'Voter not found' });
        if (voter.hasVoted) return res.status(400).json({ message: 'You have already voted' });
        // Face verification
        const payload = { encoding: voter.faceEncoding, image: faceImage };
        const response = await require('axios').post('http://localhost:5001/verify-encoding', payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.data.match) {
            return res.status(401).json({ message: 'Face does not match', distance: response.data.distance });
        }
        // Cast vote
        const candidate = await require('../models/Candidate').findById(candidateId);
        if (!candidate || !candidate.isActive) {
            return res.status(404).json({ message: 'Candidate not found' });
        }
        candidate.votes += 1;
        await candidate.save();
        voter.hasVoted = true;
        voter.votedFor = candidate._id;
        voter.votedParty = candidate.partyName;
        await voter.save();
        res.json({ message: 'Vote cast successfully', distance: response.data.distance });
    } catch (error) {
        console.error('[verifyAndVote] Error:', error);
        res.status(500).json({ message: 'Error verifying face and casting vote', details: error.message });
    }
};

// Cast vote
exports.castVote = async (req, res) => {
    try {
        console.log("[castVote] vote attempt", {
            userId: req.user && req.user._id,
            candidateId: req.body.candidateId
        });
        const { candidateId } = req.body;
        const voter = await User.findById(req.user.id);
        if (!voter) {
            console.log("[castVote] Voter not found", req.user.id);
            return res.status(404).json({ message: 'Voter not found' });
        }
        if (voter.hasVoted) {
            console.log("[castVote] Voter has already voted", voter._id);
            return res.status(400).json({ message: 'You have already voted' });
        }
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            console.log("[castVote] Candidate not found", candidateId);
            return res.status(404).json({ message: 'Candidate not found' });
        }
        if (!candidate.isActive) {
            console.log("[castVote] Candidate is not active", candidateId);
            return res.status(404).json({ message: 'Candidate not found' });
        }
        // Update candidate votes
        candidate.votes += 1;
        await candidate.save();
        console.log("[castVote] Candidate votes incremented", candidate._id, candidate.votes);
        // Mark voter as voted
        voter.hasVoted = true;
        voter.votedFor = candidate._id;
        voter.votedParty = candidate.partyName;
        await voter.save();
        console.log("[castVote] Voter marked as voted", voter._id);
        res.json({ message: 'Vote cast successfully' });
    } catch (error) {
        console.error('[castVote] Voting error:', error);
        res.status(500).json({ message: 'Error casting vote' });
    }
};
