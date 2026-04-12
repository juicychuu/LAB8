const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/checkout', verifyToken, orderController.checkout);

module.exports = router;