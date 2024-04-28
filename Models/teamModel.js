const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const User = require('./userModel') //. Import the User model

//* TEAM SCHEMA *
const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Circuit name required"],
    unique: true,    
  },
  picture: String,
  pilots: [{
    _id: {
      type: mongoose.Schema.ObjectId,
      ref: "Users"
    },
    name: String,
    age: Number,
    country: String,
    picture : String
  }]
})


const Team = mongoose.model('Team', teamSchema);
module.exports = Team;