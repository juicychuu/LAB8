const express           = require('express');
const router            = express.Router();
const productController = require('../controllers/productController');
const verifyToken       = require('../middleware/authMiddleware');
const isAdmin           = require('../middleware/adminMiddleware');
const upload            = require('../middleware/uploadMiddleware');

const fs = require('fs');
const path = require('path');
const db = require('../config/db'); 


router.get('/', productController.getAllProducts);
router.get('/category/:category/top', productController.getTopProductsByCategory);
router.get('/:id', productController.getProductById);
router.get('/:id/reviews', productController.getProductReviews);


router.post('/:id/reviews', verifyToken, productController.createProductReview);
router.post('/', verifyToken, isAdmin, upload.single('image'), productController.createProduct);
router.put('/:id', verifyToken, isAdmin, upload.single('image'), productController.updateProduct);


router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const [products] = await db.query('SELECT image_url FROM products WHERE id = ?', [id]);
        
        if (products.length === 0) return res.status(404).json({ message: "Product not found" });

        const rawFileName = products[0].image_url;

        if (rawFileName) {
            const pureFileName = path.basename(rawFileName); 
            const filePath = path.resolve(__dirname, '..', 'uploads', pureFileName);
            
            
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.query('DELETE FROM products WHERE id = ?', [id]);
        res.json({ message: "Product and image deleted successfully" });

    } catch (error) {
        
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;