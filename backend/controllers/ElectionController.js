const Election = require('../models/Election');
const Candidate = require('../models/Candidate');

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
