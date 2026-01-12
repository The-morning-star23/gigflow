const express = require('express');
const router = express.Router();
const { createGig, getGigs } = require('../controllers/gigController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/gigs
router.get('/', getGigs); 

router.post('/', protect, createGig); 

module.exports = router;