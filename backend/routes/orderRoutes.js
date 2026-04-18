const express         = require('express');
const router          = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken     = require('../middleware/authMiddleware');
const isAdmin         = require('../middleware/adminMiddleware');

router.post('/checkout',    verifyToken,          orderController.checkout);
router.get('/my-orders',    verifyToken,          orderController.getMyOrders);
router.get('/all',          verifyToken, isAdmin, orderController.getAllOrders);
router.put('/:id/status',   verifyToken, isAdmin, orderController.updateOrderStatus);

module.exports = router;