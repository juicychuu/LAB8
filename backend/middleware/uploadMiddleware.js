const multer = require('multer');
const path   = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 1. Point to the sibling 'avatar' folder
    if (req.originalUrl.includes('upload-avatar')) {
      // This goes UP one level from middleware/ then into the 'avatar' folder
      cb(null, path.join(__dirname, '../avatar')); 
    } else {
      cb(null, path.join(__dirname, '../uploads'));
    }
  },
  filename: (req, file, cb) => {
    // Keep this logic, it's good!
    const userId = (req.user && req.user.id) ? req.user.id : 'anon-' + Date.now();
    const cleanName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-user-${userId}-${cleanName}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (/\.(jpe?g|png|gif|webp)$/i.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'));
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});