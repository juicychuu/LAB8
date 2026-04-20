const express           = require('express');
const router            = express.Router();
const productController = require('../controllers/productController');
const verifyToken       = require('../middleware/authMiddleware');
const isAdmin           = require('../middleware/adminMiddleware');
const upload            = require('../middleware/uploadMiddleware');

// ── GET ROUTES ──────────────────────────────────────────────

// Get all products (supports ?keyword= search)
router.get('/', productController.getAllProducts);

// Get Top 5 products by category 
router.get('/category/:category/top', productController.getTopProductsByCategory);

// Get a single product by ID
router.get('/:id', productController.getProductById);

// Get all reviews for a product
router.get('/:id/reviews', productController.getProductReviews);


// ── POST / PROTECTED ROUTES ─────────────────────────────────

// Add a product review 
router.post('/:id/reviews', verifyToken, productController.createProductReview);

// Create a new product (Admin only)
router.post('/', verifyToken, isAdmin, upload.single('image'), productController.createProduct);

// Update a product (Admin only)
router.put('/:id', verifyToken, isAdmin, upload.single('image'), productController.updateProduct);

// Delete a product (Admin only)
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;