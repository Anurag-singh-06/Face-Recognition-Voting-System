const Candidate = require('../models/Candidate');
const User = require('../models/User');

// Get all candidates
exports.getAllCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find({ isActive: true });
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching candidates' });
    }
};

// Add new candidate
exports.addCandidate = async (req, res) => {
    try {
        const { name, partyName, partySymbol } = req.body;

        const candidate = new Candidate({
            name,
            partyName,
            partySymbol
        });

        await candidate.save();
        res.status(201).json(candidate);
    } catch (error) {
        res.status(500).json({ message: 'Error adding candidate' });
    }
};

// Delete candidate
exports.deleteCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        res.json({ message: 'Candidate deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting candidate' });
    }
};

// Delete all candidates
exports.deleteAllCandidates = async (req, res) => {
    try {
        await Candidate.updateMany({}, { isActive: false });
        res.json({ message: 'All candidates deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting candidates' });
    }
};

// Reset vote counts (admin only)
exports.resetAllVotes = async (req, res) => {
    try {
        const result = await Candidate.updateMany(
            { isActive: true }, 
            { votes: 0 }
        );

        console.log('Reset results:', {
            candidatesUpdated: result.modifiedCount
        });

        res.json({ 
            message: 'All vote counts reset to zero',
            candidatesUpdated: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting votes' });
    }
};

// Get election results
exports.getResults = async (req, res) => {
    try {
        const results = await Candidate.find({ isActive: true })
            .select('name partyName votes')
            .sort('-votes');
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching results' });
    }
};
