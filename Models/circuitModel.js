const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const User = require('./userModel') //. Import the User model


//* CIRCUIT SCHEMA *
const circuitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Circuit name required"],
    unique: true,
    trim: true
  },
  country: {
    type: String,
    required: [true, "Country required"]
  },
  circuitLength: {
    type: Number,
    required: [true, "Circuit length mandatory"],
    min: [300, "Circuit length must be between 300 and 700km"],
    max: [700, "Circuit length must be between 300 and 700km"]
  },
  laps: {
    type: Number,
    required: [true, "Laps must be declared to calculate the lap length"],
    min: [20, "Laps limits are 20 and 80"],
    max: [80, "Laps limits are 20 and 80"]
  },
  // userId: { //! Nu cred ca imi trebuie aici
  //   type: mongoose.Schema.ObjectId,
  //   ref: "Users"
  // } 
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)


circuitSchema.virtual('lapKmLength').get(function () {
  let lapLength = this.circuitLength / this.laps
  return +lapLength.toFixed(1)
})




const Circuit = mongoose.model('Circuit', circuitSchema);
module.exports = Circuit;