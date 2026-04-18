const User = require('../models/User');

exports.getAllUsers = async (_req, res) => {
  try {
    return res.json(await User.getAll());
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id)
      return res.status(400).json({ error: 'You cannot delete your own account.' });

    const affected = await User.deleteById(req.params.id);
    if (!affected) return res.status(404).json({ error: 'User not found.' });
    return res.json({ message: 'User deleted.' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};