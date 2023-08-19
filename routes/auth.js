const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    console.log('Retrieved user:', user);
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Retrieved password:', isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
     
    const token = jwt.sign({ userId: user._id }, config.secret, { expiresIn: '1h' });
    
    res.status(200).json({ message: 'Authentication successful', token});
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error authenticating user' });
  }
});

module.exports = router;
