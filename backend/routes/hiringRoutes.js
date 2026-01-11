const express = require('express');
const router = express.Router();
const { hireFreelancer } = require('../controllers/hiringController');
// const { protect } = require('../middleware/authMiddleware'); // We'll build this next

router.patch('/:bidId/hire', hireFreelancer);

module.exports = router;