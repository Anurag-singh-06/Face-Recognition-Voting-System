const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const User = require('../models/User');


exports.createElection = async (req, res) => {
  try {
    const { title, startDate, endDate, parties } = req.body;

    // Validate required fields
    if (!title || !startDate || !endDate || !parties || !Array.isArray(parties) || parties.length === 0) {
      return res.status(400).json({ message: 'All required fields must be provided and valid' });
    }

    // Validate date logic
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Optional: Validate if parties exist in DB
    const validParties = await Candidate.find({ _id: { $in: parties }, isActive: true });
    if (validParties.length !== parties.length) {
      return res.status(400).json({ message: 'One or more parties are invalid or inactive' });
    }

    // Create new election
    const election = new Election({
      title,
      startDate,
      endDate,
      parties,
    });

    await election.save();

    res.status(201).json({ message: 'Election created successfully', election });
  } catch (error) {
    console.error('Error creating election:', error);
    res.status(500).json({ message: 'Error creating election' });
  }
};


exports.getLiveElections = async (req, res) => {
  try {
    const currentDate = new Date();

    const liveElections = await Election.find({
      endDate: { $gte: currentDate }
    }).populate('parties'); // optional: populates party/candidate info

    res.status(200).json({ elections: liveElections });
  } catch (error) {
    console.error('Error fetching live elections:', error);
    res.status(500).json({ message: 'Error fetching live elections' });
  }
};

// controllers/electionController.js (or similar)

exports.getPreviousElections = async (req, res) => {
  try {
    const currentDate = new Date();

    const previousElections = await Election.find({
      endDate: { $lt: currentDate }
    }).populate('parties'); // populate parties info if needed

    res.status(200).json({ elections: previousElections });
  } catch (error) {
    console.error('Error fetching previous elections:', error);
    res.status(500).json({ message: 'Error fetching previous elections' });
  }
};

// Get elections available for voting (current elections)
exports.getActiveElections = async (req, res) => {
  try {
    const currentDate = new Date();
    
    const activeElections = await Election.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    }).select('title startDate endDate'); // Only get essential fields

    res.status(200).json({ elections: activeElections });
  } catch (error) {
    console.error('Error fetching active elections:', error);
    res.status(500).json({ message: 'Error fetching active elections' });
  }
};

exports.getElectionParties = async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId)
      .populate('parties') // This populates the party details
      .exec();

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    res.status(200).json({
      success: true,
      data: election.parties
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Submit a vote
exports.submitVote = async (req, res) => {
  try {
    const { electionId, partyId } = req.body;
    
    // Ensure user is properly authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const voterId = req.user.id; // Changed from _id to id for consistency

    // Check if election is still active
    const election = await Election.findOne({
      _id: electionId,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      isActive: true
    });

    if (!election) {
      return res.status(400).json({ message: 'Election is not active' });
    }

    // Check if party exists in this election
    if (!election.parties.includes(partyId)) {
      return res.status(400).json({ message: 'Invalid party for this election' });
    }

    // Check if user already voted in this election
    const user = await User.findById(voterId);
    if (user.votes.some(v => v.election.toString() === electionId)) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    // Record the vote
    user.votes.push({
      election: electionId,
      party: partyId,
      votedAt: new Date()
    });

    await user.save();

    res.status(201).json({ message: 'Vote recorded successfully' });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ message: 'Error submitting vote', error: error.message });
  }
};