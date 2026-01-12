const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ message: "User created" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }).json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    // req.user is already populated by the 'protect' middleware
    res.status(200).json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // Sets expiration to the past
  });
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { register, login, getMe, logout };