exports.checkout = async (req, res) => {
    const {items, total_amount} = req.body;
    const userId = req.user.id;

    for (const item of items) {
        await Order.createOrderItem(orderId, item.id, item.quantity, item.price);
    }

    res.status(201).json({ message: 'Order placed successfully', orderId });
};