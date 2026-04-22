const db = require('../config/db');

class Order {
  static async createOrder(userId, totalAmount) {
    const [r] = await db.execute(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?,?,?)', 
      [userId, totalAmount, 'delivered'] 
    );
    return r.insertId;
  }

  static async createOrderItem(orderId, productId, quantity, priceAtPurchase) {
    await db.execute(
      'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?,?,?,?)',
      [orderId, productId, quantity, priceAtPurchase]);
  }

  // --- NEW: Paginated Orders for Admin ---
  static async getAllOrdersPaginated(limit, offset) {
    // 1. Get the total count of all orders
    const [countRows] = await db.execute('SELECT COUNT(*) as count FROM orders');
    const total = countRows[0].count;

    // 2. Get the specific 15 orders for this page
    const [rows] = await db.execute(
      `SELECT o.id, o.total_amount, o.status, o.created_at,
              u.username, u.email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [String(limit), String(offset)] // Cast to string to ensure some drivers handle LIMIT correctly
    );

    return { orders: rows, total };
  }

  // --- NEW: Paginated Orders for Specific User ---
  static async getOrdersByUserPaginated(userId, limit, offset) {
    // 1. Get total count for this user
    const [countRows] = await db.execute('SELECT COUNT(*) as count FROM orders WHERE user_id = ?', [userId]);
    const total = countRows[0].count;

    // 2. Get user's orders for this page
    const [rows] = await db.execute(
      `SELECT id, total_amount, status, created_at 
       FROM orders 
       WHERE user_id = ? 
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, String(limit), String(offset)]
    );

    return { orders: rows, total };
  }

  // Keep these for backward compatibility if needed
  static async getOrdersByUser(userId) {
    const [rows] = await db.execute(
      `SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }

  static async getAllOrders() {
    const [rows] = await db.execute(
      `SELECT o.id, o.total_amount, o.status, o.created_at, u.username, u.email
       FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC`
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