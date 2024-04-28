const express = require('express');
const usersController = require('./../Controllers/usersController');
const router = express.Router();
const authController = require('../Controllers/authController')


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
  .patch(usersController.updateUser) //! Include the multer middleware here
  .delete(usersController.deleteUser)


router.route('/addCircuits/:id')
  .post(usersController.addCircuitToArray)


router.route('/removeCircuits/:id')
  .delete(usersController.removeCircuitFromArray)




module.exports = router;
