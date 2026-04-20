const db = require('../config/db');

class Cart {
  // Get all items for a specific user
  static async getByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image_url, p.stock 
       FROM cart_items c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?`,
      [userId]
    );
    return rows;
  }

  // Add or Update item in cart
  static async addItem(userId, productId, quantity) {
    // Check if item already exists in cart
    const [existing] = await db.execute(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existing.length > 0) {
      // Update quantity
      return await db.execute(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
        [quantity, existing[0].id]
      );
    } else {
      // Insert new row
      return await db.execute(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, quantity]
      );
    }
  }

  static async removeItem(userId, productId) {
    return await db.execute(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
  }

  static async clear(userId) {
    return await db.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  }
}

module.exports = Cart;