const express = require('express');
const router = express.Router();

const circuitsController = require('../Controllers/circuitsController');
const authController = require('../Controllers/authController')


//* PROTECT ALL BELOW ROUTES  *
//note: pt ca linia este scrisa deasupra `ROUTES`, va trece mai intai prin aceasta, apoi prin celelalte
//! GLOBAL
router.use(authController.protect)



//* ROUTES * 
router.route('/')
  .get(circuitsController.getAllCircuits)
  .post(circuitsController.createCircuit)

router.route('/:id')
  .get(circuitsController.getCircuit)
  .patch(circuitsController.updateCircuit)
  .delete(circuitsController.deleteCircuit)

module.exports = router;
