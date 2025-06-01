const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const candidateController = require('../controllers/candidateController');

// All routes require authentication and admin role
router.use(protect, admin);

router.get('/candidates', candidateController.getAllCandidates);
router.post('/candidates', candidateController.addCandidate);
router.delete('/candidates/:id', candidateController.deleteCandidate);
router.delete('/candidates', candidateController.deleteAllCandidates);
router.post('/reset-votes', candidateController.resetAllVotes);
router.get('/results', candidateController.getResults);

module.exports = router;
