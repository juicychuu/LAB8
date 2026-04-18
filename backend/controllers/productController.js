const Product = require('../models/Product');

exports.getAllProducts = async (_req, res) => {
  try {
    return res.json(await Product.getAll());
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const p = await Product.getById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Product not found.' });
    return res.json(p);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    // 1. Add 'category' to the destructuring
    const { name, description, price, stock, category } = req.body; 
    
    if (!name || !price)
      return res.status(400).json({ error: 'Name and price are required.' });

    const imageUrl  = req.file ? `/uploads/${req.file.filename}` : null;

    // 2. Add 'category' as the last argument here
    const productId = await Product.create(
      name, description, parseFloat(price), parseInt(stock) || 0, imageUrl, category
    );

    return res.status(201).json({ message: 'Product created.', productId });
  } catch (err) {
    console.error('createProduct:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    // 1. Add 'category' here
    const { name, description, price, stock, category } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // 2. Add 'category' as the second to last argument (matching your model order)
    const affected = await Product.update(
      req.params.id, name, description,
      parseFloat(price), parseInt(stock) || 0, imageUrl, category
    );

    if (!affected) return res.status(404).json({ error: 'Product not found.' });
    return res.json({ message: 'Product updated.' });
  } catch (err) {
    console.error('updateProduct:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const affected = await Product.deleteById(req.params.id);
    if (!affected) return res.status(404).json({ error: 'Product not found.' });
    return res.json({ message: 'Product deleted.' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};