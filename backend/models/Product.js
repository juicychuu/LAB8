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
    
    const [r] = await db.execute(
      'INSERT INTO products (name, description, price, stock, image_url, category) VALUES (?,?,?,?,?,?)',
      [name, description, price, stock, imageUrl, category]);
    return r.insertId;
  }

  static async update(id, name, description, price, stock, imageUrl, category) {
   
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

  // Get reviews for a specific product
  static async getReviews(productId) {
    const [rows] = await db.execute('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC', [productId]);
    return rows;
  }

  // Add a review and update the product's average rating
  static async addReview(productId, userId, name, rating, comment) {
    // 1. Insert the new review
    await db.execute(
      'INSERT INTO reviews (product_id, user_id, name, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [productId, userId, name, rating, comment]
    );

    // 2. Recalculate average rating and count for this product
    const [stats] = await db.execute(
      'SELECT COUNT(*) as count, AVG(rating) as average FROM reviews WHERE product_id = ?',
      [productId]
    );

    // 3. Update the product table with the new stats
    await db.execute(
      'UPDATE products SET rating = ?, num_reviews = ? WHERE id = ?',
      [stats[0].average || 0, stats[0].count || 0, productId]
    );
  }

  // Get Top 5 products in a category by rating
  static async getTopByCategory(category) {
    const [rows] = await db.execute(
      'SELECT * FROM products WHERE category = ? ORDER BY rating DESC LIMIT 5',
      [category]
    );
    return rows;
  }

  // Modified Search: Sort by Rating Descending
  static async search(keyword) {
    const query = `%${keyword}%`;
    const [rows] = await db.execute(
      'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY rating DESC',
      [query, query]
    );
    return rows;
  }
}

module.exports = Product;