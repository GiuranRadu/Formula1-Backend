const express = require('express');
const router = express.Router();

const optionalController = require('./../Controllers/optionalController');
const authController = require('../Controllers/authController')


//* Protect & Permission All bellow routes *
//note: pt ca linia este scrisa deasupra `ROUTES`, va trece mai intai prin aceasta, apoi prin celelalte
//! GLOBAL
router.use(authController.protect , authController.permission)


//* Optional routes
router.route('/pilotStats')
  .get(optionalController.pilotStats)


router.route('/circuitsStats')
  .get(optionalController.circuitsStats)



module.exports = router;
