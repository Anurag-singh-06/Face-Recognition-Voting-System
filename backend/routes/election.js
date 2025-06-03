const express = require('express');
const router = express.Router();
const electionController = require('../controllers/ElectionController');

// Create election (POST)
router.post('/add', electionController.createElection);
router.get('/live', electionController.getLiveElections);
router.get('/previous', electionController.getPreviousElections);

// You can add more endpoints here: get all elections, get election by id, update, delete etc.

module.exports = router;
