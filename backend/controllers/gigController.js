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
      ownerId: req.user.id 
    });

    // POPULATE owner details so the UI shows the name immediately via Sockets
    const populatedGig = await Gig.findById(gig._id).populate('ownerId', 'name email');
    
    const io = req.app.get('io');
    io.emit('new-gig-added', populatedGig); 

    res.status(201).json(populatedGig);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Gigs (Supports Home, Browse, and Dashboard filtering)
const getGigs = async (req, res) => {
  const { search, status, limit, all } = req.query; 
  
  let query = {};
  
  // If status=open is passed, only show open ones (used in Browse 'Active Only')
  if (status === 'open') {
    query.status = 'open';
  }

  // Search logic
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  try {
    // FIX PROBLEM 4: 
    // If 'limit' is provided, use it (Home page). 
    // If no limit is provided, use 0 (Mongoose interprets 0 as no limit).
    const resultLimit = limit ? parseInt(limit) : 0; 

    const gigs = await Gig.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 }) 
      .limit(resultLimit); 

    res.json(gigs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit a Bid
const postBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    // Safety check for assigned gigs
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ error: "Gig not found" });

    if (gig.status !== 'open') {
      return res.status(400).json({ error: "Cannot bid on a gig that is already assigned." });
    }

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