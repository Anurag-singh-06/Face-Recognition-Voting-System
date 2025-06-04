const express = require('express');
const router = express.Router();
const electionController = require('../controllers/ElectionController');
const { protect, verifiedVoter } = require('../middleware/auth');

// Create election (POST)
router.post('/add', electionController.createElection);
router.get('/live', electionController.getLiveElections);
router.get('/previous', electionController.getPreviousElections);

router.get('/active', electionController.getActiveElections);

// Get parties for a specific election
router.get('/:electionId/parties', electionController.getElectionParties);

// Submit a vote (protected route - requires authentication)
router.post('/vote',protect, verifiedVoter, electionController.submitVote);

// You can add more endpoints here: get all elections, get election by id, update, delete etc.

module.exports = router;
