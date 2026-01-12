const express = require('express');
const { register, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Public Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected Routes
router.get('/me', protect, getMe);

module.exports = router;