const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/authMiddleware'); // Import the function directly

router.get('/', auth, cartController.getCart);
router.post('/', auth, cartController.addToCart);

// NEW: Clear entire cart (This is what your checkout calls)
router.delete('/', auth, cartController.clearCart); 

// Existing: Remove specific item
router.delete('/:productId', auth, cartController.removeFromCart);

module.exports = router;