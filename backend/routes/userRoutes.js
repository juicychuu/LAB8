const express        = require('express');
const router         = express.Router();
const userController = require('../controllers/userController');
const verifyToken    = require('../middleware/authMiddleware');
const isAdmin        = require('../middleware/adminMiddleware');
// 1. Import your smart middleware
const upload         = require('../middleware/uploadMiddleware');
const db             = require('../config/db'); // Ensure this points to your DB config

router.get('/',      verifyToken, isAdmin, userController.getAllUsers);
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);

// 2. Add the Upload Route
// 'profile_pic' is the name the frontend will use to send the file
// ... existing code ...

router.post('/upload-avatar', verifyToken, upload.single('profile_pic'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // FIX THIS LINE: Remove the 's' so it matches your folder name 'avatar'
        const filePath = `avatar/${req.file.filename}`; 
        
        // This is the user ID from your token
        const userId = req.user.id;

        // 3. Update the user record
        // Note: Using await db.query is often safer with MySQL pools
        await db.query(
            'UPDATE users SET profile_pic = ? WHERE id = ?',
            [filePath, userId]
        );

        res.json({
            message: 'Profile picture updated!',
            profile_pic: filePath
        });
    } catch (error) {
        console.error('SERVER LOG ERROR:', error);
        res.status(500).json({ 
            message: 'Server Error', 
            details: error.message 
        });
    }
});

module.exports = router;