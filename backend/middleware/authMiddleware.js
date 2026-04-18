const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Try to get token from Cookie OR from Authorization Header
  let token = req.cookies.token;

  if (!token && req.headers.authorization) {
    // If it's in the header, it looks like "Bearer <token>", so we split it
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid.' });
  }
};