const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.getAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stock_quantity } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;
        
        const productId = await Product.create(name, description, price, stock_quantity, image_url);
        res.status(201).json({ message: 'Product created', productId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};