const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');
const verifyToken    = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');
const rateLimit      = require('express-rate-limit');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
});

router.post('/register',
  [ body('username').notEmpty().withMessage('Username required.'),
    body('email').isEmail().withMessage('Valid email required.'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars.') ],
  validate, authController.register);

router.post('/login', authLimiter,
  [ body('email').isEmail().withMessage('Valid email required.'),
    body('password').notEmpty().withMessage('Password required.') ],
  validate, authController.login);

router.post('/logout', authController.logout);
router.get('/me',      verifyToken, authController.getMe);

module.exports = router;