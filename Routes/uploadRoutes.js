const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = require('../Utils/fileUpload.js')
const upload = multer({ storage: storage }).single('picture');

router.route('/')
  .post(upload, (req, res, next) => {
    // console.log(req.file);
    if (!req.file) {
      res.status(404).json({
        status: 'failed',
        message: 'File not found'
      })
    } else {
      res.json({
        success: 1,
        image_url: req.file.path
      })
    }
  })

module.exports = router;