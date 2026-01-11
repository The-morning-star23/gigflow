const express = require('express');
const { createGig, getGigs, postBid } = require('../controllers/gigController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getGigs); // Public: anyone can see open gigs
router.post('/', protect, createGig); // Protected: must be logged in
router.post('/bid', protect, postBid); // Protected

module.exports = router;