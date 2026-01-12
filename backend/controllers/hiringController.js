const mongoose = require('mongoose');
const Gig = require('../models/Gig');
const Bid = require('../models/Bid');

const hireFreelancer = async (req, res) => {
  const { bidId } = req.params;
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const selectedBid = await Bid.findById(bidId).session(session);
    if (!selectedBid) throw new Error("Bid not found");

    const gig = await Gig.findById(selectedBid.gigId).session(session);

    if (!gig) throw new Error("Gig associated with this bid was not found.");
    
    if (gig.status !== 'open') {
      throw new Error("This gig is no longer open for hiring.");
    }

    gig.status = 'assigned';
    gig.hiredFreelancerId = selectedBid.freelancerId;
    await gig.save({ session });

    selectedBid.status = 'hired';
    await selectedBid.save({ session });

    await Bid.updateMany(
      { gigId: gig._id, _id: { $ne: bidId } },
      { $set: { status: 'rejected' } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const io = req.app.get('io');
    io.emit('gig-status-updated', { 
      gigId: gig._id, 
      status: 'assigned' 
    });

    const freelancerSocketId = global.onlineUsers.get(selectedBid.freelancerId.toString());

    if (freelancerSocketId) {
      io.to(freelancerSocketId).emit('hired-notification', {
        message: `You have been hired for: ${gig.title}!`,
        gigId: gig._id
      });
    }

    res.status(200).json({ message: "Freelancer hired and others notified/rejected." });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
};

const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Employer View: Gigs I POSTED (Show everything I own)
    const myGigs = await Gig.find({ ownerId: userId }).sort({ createdAt: -1 });

    // 2. Freelancer View: Gigs where I was HIRED (Exclude gigs I own)
    const myJobs = await Gig.find({ 
      hiredFreelancerId: userId,
      ownerId: { $ne: userId },
      status: 'assigned' 
    })
    .populate('ownerId', 'name email')
    .lean();

    res.status(200).json({
      myGigs,
      myJobs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { hireFreelancer, getUserDashboard };