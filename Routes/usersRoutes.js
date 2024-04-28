const express = require('express');
const usersController = require('./../Controllers/usersController');
const router = express.Router();
const authController = require('../Controllers/authController')

const multer = require('multer');

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


//* PROTECT ALL BELOW ROUTES  *
//note: pt ca linia este scrisa deasupra `ROUTES`, va trece mai intai prin aceasta, apoi prin celelalte
//! GLOBAL
router.use(authController.protect) 


// * ROUTES *
router.route('/')
  .get(usersController.getAllUsers)
  .post(usersController.createUser)


router.route('/:id')
  .get(usersController.getUser)
  .patch(upload, usersController.updateUser) //! Include the multer middleware here
  .delete(usersController.deleteUser)


router.route('/addCircuits/:id')
  .post(usersController.addCircuitToArray)


router.route('/removeCircuits/:id')
  .delete(usersController.removeCircuitFromArray)




module.exports = router;
