const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ALLOWED_IMAGE = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_VIDEO = ['.mp4'];

const makeStorage = (subfolder) => {
  const dest = path.join(__dirname, '..', 'uploads', subfolder);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
    }
  });
};

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ([...ALLOWED_IMAGE, ...ALLOWED_VIDEO].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Allowed: jpg, jpeg, png, webp, mp4'), false);
  }
};

const maxSize = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 25) * 1024 * 1024;

const uploadFactory = (subfolder) =>
  multer({
    storage: makeStorage(subfolder),
    fileFilter,
    limits: { fileSize: maxSize }
  });

module.exports = uploadFactory;
