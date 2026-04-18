const db = require('../config/db');

class Order {
  static async createOrder(userId, totalAmount) {
  const [r] = await db.execute(
    'INSERT INTO orders (user_id, total_amount, status) VALUES (?,?,?)', 
    [userId, totalAmount, 'delivered'] // This forces it to delivered
  );
  return r.insertId;
}
  static async createOrderItem(orderId, productId, quantity, priceAtPurchase) {
    await db.execute(
      'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?,?,?,?)',
      [orderId, productId, quantity, priceAtPurchase]);
  }
  static async getOrdersByUser(userId) {
    // Simplified query to ensure compatibility and reliability
    const [rows] = await db.execute(
      `SELECT id, total_amount, status, created_at 
       FROM orders 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }
  static async getAllOrders() {
    // This version works on older MySQL versions and still gets the username
    const [rows] = await db.execute(
      `SELECT o.id, o.total_amount, o.status, o.created_at,
              u.username, u.email
         FROM orders o
         JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC`
    );
    return rows;
}
  static async updateStatus(orderId, status) {
    const [r] = await db.execute(
      'UPDATE orders SET status=? WHERE id=?', [status, orderId]);
    return r.affectedRows;
  }
}

module.exports = Order;