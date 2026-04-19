const express        = require('express');
const router         = express.Router();
const userController = require('../controllers/userController');
const verifyToken    = require('../middleware/authMiddleware');
const isAdmin        = require('../middleware/adminMiddleware');
const upload         = require('../middleware/uploadMiddleware');
const db             = require('../config/db'); 


router.get('/',       verifyToken, isAdmin, userController.getAllUsers);


router.patch('/:id/role', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    
    const ROOT_ADMIN = 'Admin@gmail.com'; 
    const requesterEmail = req.user.email; 

    try {
       
        if (requesterEmail !== ROOT_ADMIN) {
            return res.status(403).json({ message: "Forbidden: Only the Root Admin can promote/demote users." });
        }

        
        const [target] = await db.query('SELECT email FROM users WHERE id = ?', [id]);
        if (target[0] && target[0].email === ROOT_ADMIN) {
            return res.status(403).json({ message: "The Root Admin account is a system constant and cannot be modified." });
        }

        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ message: "Role updated successfully." });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params; 
    const requesterEmail = req.user.email; 
    const ROOT_ADMIN = 'Admin@gmail.com'; 

    try {
        // 🛡️ BLOCK: Only the Root Admin can delete accounts
        if (requesterEmail !== ROOT_ADMIN) {
            return res.status(403).json({ 
                message: "Permission Denied: Only the Root Admin can delete accounts." 
            });
        }

        // 🛡️ BLOCK: Prevent the Root Admin from deleting themselves
        const [target] = await db.query('SELECT email FROM users WHERE id = ?', [id]);
        if (target[0] && target[0].email === ROOT_ADMIN) {
            return res.status(403).json({ message: "You cannot delete the Root Admin account." });
        }

        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: "User successfully deleted." });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});


// Existing Upload Route
router.post('/upload-avatar', verifyToken, upload.single('profile_pic'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const filePath = `avatar/${req.file.filename}`; 
        const userId = req.user.id;
        await db.query('UPDATE users SET profile_pic = ? WHERE id = ?', [filePath, userId]);
        res.json({ message: 'Profile picture updated!', profile_pic: filePath });
    } catch (error) {
        console.error('SERVER LOG ERROR:', error);
        res.status(500).json({ message: 'Server Error', details: error.message });
    }
});

module.exports = router;