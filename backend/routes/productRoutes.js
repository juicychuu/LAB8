const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/roleMiddleware');

router.get('/', productController.getAllProducts);
router.post('/', verifyToken, isAdmin, productController.createProduct);
router.post('/', verifyToken, isAdmin, upload.single('image'), productController.createProduct);