const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const multer = require('multer');
const path = require('path');
const picturePath = multer.diskStorage({
  //note: where to store the uploaded pictures , the 3rd parameter is a random name choosed by me
  destination: function (req, file, uploadPathHandler) {
    uploadPathHandler(null, "uploads/")
  },
  //note: format uploaded file name (optional), the 3rd parameter is a random name choosed by me
  filename: function (req, file, fileNameHandler) {
    fileNameHandler(null, file.originalname) //! save it with the original name
  }
})

const upload = multer({ storage: picturePath }).single('picture'); // Specify 'picture' as the field name

//* ROUTES *
router.route('/register')
  .post(upload, authController.register)

router.route('/login')
  .post(authController.login)

router.route('/login/forgotPassword')
  .post(authController.forgotPassword)

router.route('/login/resetPassword/:token')
  .patch(authController.resetPassword)


module.exports = router;