const Cart = require('../models/Cart');
const db = require('../config/db');

exports.getCart = async (req, res) => {
  try {
    const items = await Cart.getByUserId(req.user.id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const requestedQty = parseInt(quantity) || 1;
    const userId = req.user.id;

    const [productRows] = await db.execute(
      'SELECT stock FROM products WHERE id = ?',
      [productId]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const currentStock = productRows[0].stock;

    const [cartRows] = await db.execute(
      'SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    const quantityInCart = cartRows.length > 0 ? cartRows[0].quantity : 0;

    if (quantityInCart + requestedQty > currentStock) {
      return res.status(400).json({
        error: `Stock limit reached. You have ${quantityInCart} in cart and only ${currentStock} are available.`
      });
    }

    await Cart.addItem(userId, productId, requestedQty);
    res.json({ message: 'Item added to cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add item' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    await Cart.removeItem(req.user.id, req.params.productId);
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove item' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.clear(req.user.id);
    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};