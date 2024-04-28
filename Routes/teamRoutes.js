const express = require('express');
const teamsController = require('../Controllers/teamsController');
const router = express.Router();
const authController = require('../Controllers/authController')


//* PROTECT ALL BELOW ROUTES  *
//note: pt ca linia este scrisa deasupra `ROUTES`, va trece mai intai prin aceasta, apoi prin celelalte
//! GLOBAL
router.use(authController.protect)


router.route('/')
  .get(teamsController.getAllTeams);

  
module.exports = router;
