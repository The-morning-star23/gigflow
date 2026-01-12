const express = require('express');
const router = express.Router();
const { hireFreelancer, getUserDashboard } = require('../controllers/hiringController');
const { postBid } = require('../controllers/gigController'); 
const { protect } = require('../middleware/authMiddleware');
const Bid = require('../models/Bid');

router.post('/', protect, postBid);

router.get('/dashboard', protect, getUserDashboard);

// GET all bids for a specific gig (Used by the Client/Owner)
router.get('/:gigId', protect, async (req, res) => {
  try {
    const bids = await Bid.find({ gigId: req.params.gigId }).populate('freelancerId', 'name email');
    res.json(bids);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// The Atomic Hiring Logic
router.patch('/:bidId/hire', protect, hireFreelancer);

module.exports = router;