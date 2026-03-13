const express = require('express');
const multer = require('multer');
const path = require('path');
const md5 = require('md5');
const randomstring = require('randomstring');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = req.params.directory || 'default';
    const uploadPath = path.join(root, 'data', 'files', dir);
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const hash = md5(Date.now() + file.originalname);
    const random = randomstring.generate(5);
    cb(null, `${hash}${random}${ext}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.post(`/${appConfig.apiVersion}/data/upload/:directory`, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: '파일이 없습니다.' });
  res.json({
    success: true,
    data: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: `/${appConfig.apiVersion}/data/files/${req.params.directory}/${req.file.filename}`
    }
  });
});

module.exports = router;
