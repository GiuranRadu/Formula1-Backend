const express = require('express');
const router = express.Router();

const commentsController = require('../Controllers/commentsController')
const authController = require('../Controllers/authController')


//* PROTECT ALL BELOW ROUTES  *
//note: pt ca linia este scrisa deasupra `ROUTES`, va trece mai intai prin aceasta, apoi prin celelalte
//! GLOBAL
router.use(authController.protect)


//* Route for admin (role: full) -->  ❌ (role: limited)
//note : I need to add MIDDLEWARE to check if user role = full
router.route('/getAllComments')
  .get(commentsController.getAllComments)


//* ROUTES * 
router.route('/:id')
  .post(commentsController.createComment)
  .get(commentsController.getAnyComment)


//* More Specific Routes
router.route('/getAllComments/:userId')
  .get(commentsController.getSpecificUserComments)


router.route('/:commentId')
  .delete(commentsController.deleteComment)
  .patch(commentsController.editComment)



module.exports = router;
