const express = require('express');
const router = express.Router();
const { protect, verifiedVoter } = require('../middleware/auth');
const voteController = require('../controllers/voteController');
const candidateController = require('../controllers/candidateController');

// All routes require authentication
router.use(protect);

// Get candidates list
router.get('/candidates', verifiedVoter, candidateController.getAllCandidates);

// Face verification
router.post('/verify-face', voteController.verifyVoterFace);

// Atomic verify and vote
router.post('/verify-and-vote', verifiedVoter, voteController.verifyAndVote);

// Cast vote
router.post('/vote', verifiedVoter, voteController.castVote);

module.exports = router;
