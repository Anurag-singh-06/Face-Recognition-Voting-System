const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
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

        const payload = {
            encoding: voter.faceEncoding,
            image: faceImage
        };

        const response = await axios.post('http://localhost:5001/verify-encoding', payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.data.match) {
            res.json({ 
                message: 'Face verified successfully', 
                distance: response.data.distance 
            });
        } else {
            res.status(401).json({ 
                message: 'Face does not match', 
                distance: response.data.distance 
            });
        }
    } catch (error) {
        console.error('Face verification error:', error.response ? error.response.data : error.message);
        res.status(500).json({ 
            message: 'Error verifying face', 
            details: error.response ? error.response.data : error.message 
        });
    }
};

// Atomic face verification and vote
exports.verifyAndVote = async (req, res) => {
    try {
        const { faceImage, candidateId, electionId } = req.body;
        const voter = await User.findById(req.user.id);
        
        // Validation checks
        if (!voter) return res.status(404).json({ message: 'Voter not found' });
        
        // Check if already voted in this election
        if (voter.votedInElections && voter.votedInElections.includes(electionId)) {
            return res.status(400).json({ message: 'You have already voted in this election' });
        }

        // Face verification
        const payload = { encoding: voter.faceEncoding, image: faceImage };
        const response = await axios.post('http://localhost:5001/verify-encoding', payload);
        
        if (!response.data.match) {
            return res.status(401).json({ 
                message: 'Face verification failed', 
                distance: response.data.distance 
            });
        }

        // Verify election exists and is active
        const election = await Election.findById(electionId);
        if (!election || !election.isActive) {
            return res.status(404).json({ message: 'Election not found or inactive' });
        }

        // Verify candidate exists and belongs to this election
        const candidate = await Candidate.findById(candidateId);
        if (!candidate || !candidate.isActive) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        if (!election.parties.includes(candidateId)) {
            return res.status(400).json({ message: 'Candidate not part of this election' });
        }

        // Update candidate votes
        candidate.votes += 1;
        await candidate.save();

        // Update voter record
        if (!voter.votedInElections) {
            voter.votedInElections = [];
        }
        voter.votedInElections.push(electionId);
        voter.votedFor = candidate._id;
        voter.votedParty = candidate.partyName;
        await voter.save();

        res.json({ 
            message: 'Vote cast successfully', 
            distance: response.data.distance,
            electionId: electionId
        });
    } catch (error) {
        console.error('[verifyAndVote] Error:', error);
        res.status(500).json({ 
            message: 'Error verifying face and casting vote', 
            details: error.message 
        });
    }
};

// Cast vote without face verification (alternative)
exports.castVote = async (req, res) => {
    try {
        const { candidateId, electionId } = req.body;
        const voter = await User.findById(req.user.id);

        if (!voter) {
            return res.status(404).json({ message: 'Voter not found' });
        }

        // Check if already voted in this election
        if (voter.votedInElections && voter.votedInElections.includes(electionId)) {
            return res.status(400).json({ message: 'You have already voted in this election' });
        }

        // Verify election exists and is active
        const election = await Election.findById(electionId);
        if (!election || !election.isActive) {
            return res.status(404).json({ message: 'Election not found or inactive' });
        }

        // Verify candidate exists and belongs to this election
        const candidate = await Candidate.findById(candidateId);
        if (!candidate || !candidate.isActive) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        if (!election.parties.includes(candidateId)) {
            return res.status(400).json({ message: 'Candidate not part of this election' });
        }

        // Update candidate votes
        candidate.votes += 1;
        await candidate.save();

        // Update voter record
        if (!voter.votedInElections) {
            voter.votedInElections = [];
        }
        voter.votedInElections.push(electionId);
        voter.votedFor = candidate._id;
        voter.votedParty = candidate.partyName;
        await voter.save();

        res.json({ 
            message: 'Vote cast successfully',
            electionId: electionId
        });
    } catch (error) {
        console.error('[castVote] Error:', error);
        res.status(500).json({ message: 'Error casting vote' });
    }
};

// Get voter's voting history
exports.getVotingHistory = async (req, res) => {
    try {
        const voter = await User.findById(req.user.id)
            .populate('votedFor')
            .populate('votedInElections');

        if (!voter) {
            return res.status(404).json({ message: 'Voter not found' });
        }

        const history = voter.votedInElections.map((electionId, index) => ({
            election: electionId,
            candidate: voter.votedFor,
            party: voter.votedParty,
            // Add more details as needed
        }));

        res.json(history);
    } catch (error) {
        console.error('[getVotingHistory] Error:', error);
        res.status(500).json({ message: 'Error fetching voting history' });
    }
};

// Get election parties
exports.getElectionParties = async (req, res) => {
    try {
        const election = await Election.findById(req.params.electionId)
            .populate('parties')
            .exec();

        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        res.status(200).json({
            success: true,
            data: election.parties
        });
    } catch (error) {
        console.error('[getElectionParties] Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};