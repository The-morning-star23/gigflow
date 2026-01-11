const Gig = require('../models/Gig');
const Bid = require('../models/Bid');

// Create a Gig
const createGig = async (req, res) => {
  try {
    const { title, description, budget } = req.body;
    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user.id // From auth middleware
    });
    res.status(201).json(gig);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Open Gigs (with Search)
const getGigs = async (req, res) => {
  const { search } = req.query;
  let query = { status: 'open' };
  
  if (search) {
    query.title = { $regex: search, $options: 'i' }; // Case-insensitive search
  }

  try {
    const gigs = await Gig.find(query).populate('ownerId', 'name');
    res.json(gigs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit a Bid
const postBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;
    const bid = await Bid.create({
      gigId,
      message,
      price,
      freelancerId: req.user.id
    });
    res.status(201).json(bid);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createGig, getGigs, postBid };