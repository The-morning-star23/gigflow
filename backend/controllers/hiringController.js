const mongoose = require('mongoose');
const Gig = require('../models/Gig');
const Bid = require('../models/Bid');

const hireFreelancer = async (req, res) => {
  const { bidId } = req.params;
  
  // Start Transactional Session (Bonus 1)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Fetch the Bid
    const selectedBid = await Bid.findById(bidId).session(session);
    if (!selectedBid) throw new Error("Bid not found");

    // 2. Fetch the Gig and Check Status (Race Condition Prevention)
    const gig = await Gig.findById(selectedBid.gigId).session(session);
    if (gig.status !== 'open') {
      throw new Error("This gig is no longer open for hiring.");
    }

    // 3. Update Gig status
    gig.status = 'assigned';
    await gig.save({ session });

    // 4. Update the chosen Bid
    selectedBid.status = 'hired';
    await selectedBid.save({ session });

    // 5. Bulk Reject all other bids for this gig
    await Bid.updateMany(
      { gigId: gig._id, _id: { $ne: bidId } },
      { $set: { status: 'rejected' } },
      { session }
    );

    // Commit all changes to DB
    await session.commitTransaction();
    session.endSession();

    // 6. Real-time Notification (Bonus 2)
    const io = req.app.get('io');
    const freelancerSocketId = global.onlineUsers.get(selectedBid.freelancerId.toString());

    if (freelancerSocketId) {
      io.to(freelancerSocketId).emit('hired-notification', {
        message: `You have been hired for: ${gig.title}!`,
        gigId: gig._id
      });
    }

    res.status(200).json({ message: "Freelancer hired and others notified/rejected." });

  } catch (error) {
    // If any step fails, roll back everything
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
};

module.exports = { hireFreelancer };