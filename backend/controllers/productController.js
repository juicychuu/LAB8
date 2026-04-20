const Product = require('../models/Product');

// 1. Get All Products (Includes Keyword Search)
exports.getAllProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    let products;
    if (keyword) {
      products = await Product.search(keyword);
    } else {
      products = await Product.getAll();
    }
    return res.json(products);
  } catch (err) {
    console.error("getAllProducts Error:", err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 2. Create Product Review (The one we fixed!)
// 2. Create Product Review
exports.createProductReview = async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const product = await Product.getById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    // --- CHANGE THIS LINE ---
    // It now checks for username (from your fixed token) first!
    const reviewerName = req.user.username || req.user.name || "Verified Customer";
    // ------------------------

    await Product.addReview(
      req.params.id, 
      req.user.id, 
      reviewerName, 
      parseInt(rating), 
      comment
    );

    res.status(201).json({ message: 'Review added successfully' });
  } catch (err) {
    console.error("DATABASE ERROR IN createProductReview:", err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// 3. Get all reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Product.getReviews(req.params.id);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// 4. Get Top 5 products by category
exports.getTopProductsByCategory = async (req, res) => {
  try {
    const products = await Product.getTopByCategory(req.params.category);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// 5. Get Single Product by ID
exports.getProductById = async (req, res) => {
  try {
    const p = await Product.getById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Product not found.' });
    return res.json(p);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 6. Admin: Create Product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body; 
    if (!name || !price) return res.status(400).json({ error: 'Name and price are required.' });

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const productId = await Product.create(
      name, description, parseFloat(price), parseInt(stock) || 0, imageUrl, category
    );

    return res.status(201).json({ message: 'Product created.', productId });
  } catch (err) {
    console.error('createProduct error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 7. Admin: Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const affected = await Product.update(
      req.params.id, name, description,
      parseFloat(price), parseInt(stock) || 0, imageUrl, category
    );

    if (!affected) return res.status(404).json({ error: 'Product not found.' });
    return res.json({ message: 'Product updated.' });
  } catch (err) {
    console.error('updateProduct error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 8. Admin: Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const affected = await Product.deleteById(req.params.id);
    if (!affected) return res.status(404).json({ error: 'Product not found.' });
    return res.json({ message: 'Product deleted.' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};