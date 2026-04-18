const express           = require('express');
const router            = express.Router();
const productController = require('../controllers/productController');
const verifyToken       = require('../middleware/authMiddleware');
const isAdmin           = require('../middleware/adminMiddleware');
const upload            = require('../middleware/uploadMiddleware');

router.get('/',       productController.getAllProducts);
router.get('/:id',    productController.getProductById);
router.post('/',      verifyToken, isAdmin, upload.single('image'), productController.createProduct);
router.put('/:id',    verifyToken, isAdmin, upload.single('image'), productController.updateProduct);
router.delete('/:id', verifyToken, isAdmin,                         productController.deleteProduct);

module.exports = router;