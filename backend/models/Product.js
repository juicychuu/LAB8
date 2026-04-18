const db = require('../config/db');

class Product {
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM products ORDER BY created_at DESC');
    return rows;
  }
  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  }
  static async create(name, description, price, stock, imageUrl = null, category) {
    // 👇 Added 'category' to the columns and the VALUES (?)
    const [r] = await db.execute(
      'INSERT INTO products (name, description, price, stock, image_url, category) VALUES (?,?,?,?,?,?)',
      [name, description, price, stock, imageUrl, category]);
    return r.insertId;
  }

  static async update(id, name, description, price, stock, imageUrl, category) {
    // 👇 Added category=? to the SET list
    const [r] = await db.execute(
      `UPDATE products
          SET name=?, description=?, price=?, stock=?, category=?,
              image_url=COALESCE(?, image_url)
        WHERE id=?`,
      [name, description, price, stock, category, imageUrl, id]);
    return r.affectedRows;
  }
  static async deleteById(id) {
    const [r] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
    return r.affectedRows;
  }
  static async decrementStock(id, qty) {
    await db.execute(
      'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [qty, id, qty]);
  }
}

module.exports = Product;