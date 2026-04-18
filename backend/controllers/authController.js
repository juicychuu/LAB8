const User   = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'Username, email, and password are required.' });

    if (await User.findByEmail(email))
      return res.status(400).json({ error: 'Email is already in use.' });

    const hash   = await bcrypt.hash(password, 10);
    const userId = await User.create(username, email, hash, 'user');
    return res.status(201).json({ message: 'Registered successfully.', userId });
  } catch (err) {
    console.error('Register:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok)  return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // ... keep the res.cookie line above this ...
    res.cookie('token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   24 * 60 * 60 * 1000,
    });

    // CHANGE THIS PART: Add token to the object below
    return res.json({
      message: 'Logged in successfully.',
      token: token, // <--- ADD THIS LINE
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        profile_pic: user.profile_pic // Make sure this is here too!
      },
    });
  } catch (err) {
    console.error('Login:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.logout = (_req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully.' });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};