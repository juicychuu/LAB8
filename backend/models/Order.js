const db = require('../config/db');

class Order {
    static async createOrder(user_id, totalAmount) {
        const [result] = await db.execute(
            'INSERT INTO orders (user_id, total_amount) VALUES (?,?,?)',
            [user_id, totalAmount, 'Pending']
        );
        return result.insertId;
    }

    static async createOrderItem (oderId,productId, quantity, priceAtPurchase) {
        await db.execute(
            'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
            [oderId, productId, quantity, priceAtPurchase]
        );
    }       
}