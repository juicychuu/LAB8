const Order = require('../models/Order');

exports.checkout = async (req, res) => {
    const { items, total_amount } = req.body;
    const userId = req.user.id;

    // 1. Create the main order
    const orderId = await Order.createOrder(userId, total_amount);

    // 2. Create order items
    for (const item of items) {
        await Order.createOrderItem(orderId, item.id, item.quantity, item.price);
    }

    res.status(201).json({ message: 'Order placed successfully', orderId });
};