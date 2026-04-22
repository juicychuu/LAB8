const Order   = require('../models/Order');
const Product = require('../models/Product');

exports.checkout = async (req, res) => {
  try {
    const { items, total_amount, payment } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: 'Cart is empty.' });

    if (!payment || !payment.cardNumber)
      return res.status(400).json({ error: 'Payment information is required.' });

    
    for (const item of items) {
      const product = await Product.getById(item.id);

      if (!product) {
        return res.status(404).json({ error: `Product "${item.name}" not found.` });
      }

      if (product.stock < item.quantity) {
        
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Only ${product.stock} left in store!` 
        });
      }
    }


    const orderId = await Order.createOrder(userId, total_amount);

   
    for (const item of items) {
      await Order.createOrderItem(orderId, item.id, item.quantity, item.price);
      await Product.decrementStock(item.id, item.quantity);
    }

    return res.status(201).json({
      message: 'Order placed successfully.',
      orderId,
      simulatedPayment: {
        status: 'approved',
        transactionId: `TXN-${Date.now()}`,
        last4: String(payment.cardNumber).replace(/\s/g, '').slice(-4),
        amount: total_amount,
      },
    });

  } catch (err) {
    console.error('Checkout Error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const offset = (page - 1) * limit;

    const { orders, total } = await Order.getOrdersByUserPaginated(req.user.id, limit, offset);
    
    return res.json({
      orders,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
exports.getAllOrders = async (req, res) => {
  try {
    // Get the page from the URL (?page=1), default to 1
    const page = parseInt(req.query.page) || 1;
    const limit = 15; 
    const offset = (page - 1) * limit;

    // Call the new paginated method
    const { orders, total } = await Order.getAllOrdersPaginated(limit, offset);
    
    return res.json({
      orders,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Admin Orders Error:', err); 
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const valid = ['pending','processing','shipped','delivered','cancelled'];
    if (!valid.includes(req.body.status))
      return res.status(400).json({ error: 'Invalid status value.' });

    const affected = await Order.updateStatus(req.params.id, req.body.status);
    if (!affected) return res.status(404).json({ error: 'Order not found.' });
    return res.json({ message: 'Order status updated.' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};