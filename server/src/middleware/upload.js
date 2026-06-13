import path from 'path';
import multer from 'multer';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const isZip = file.mimetype.includes('zip') || file.originalname.endsWith('.zip');
    if (!isZip) return cb(null, 'uploads/images');
    cb(null, req.originalUrl.includes('/products') ? 'uploads/products' : 'uploads/templates');
  },
  filename(req, file, cb) {
    const safe = file.originalname.replace(/[^a-z0-9.]/gi, '-').toLowerCase();
    cb(null, `${Date.now()}-${safe}`);
  }
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.zip', '.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) cb(null, true);
  else cb(new Error('Only zip and image files are allowed'));
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: 250 * 1024 * 1024 } });
