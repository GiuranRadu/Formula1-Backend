const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const User = require('./userModel') //. Import the User model

//* COMMENT SCHEMA *
const commentSchema = new mongoose.Schema({
  creatorName : {
    type : String,
    required: [true, "Name required"],
  },
  creatorId: {
    type: mongoose.Schema.ObjectId,
    ref: "Users"
  },
  circuitId: {
    type: mongoose.Schema.ObjectId,
    ref: "Circuits"
  },
  info: {
    type: String,
    required: [true, "Circuit name required"],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,  //note: Fara paranteze -> momentul crearii ; Cu paranteze -> momentul pornirii serverului
    select: true //note: true => display ; false => !display
  },
})

const Comment = mongoose.model('Comment', commentSchema)
module.exports = Comment;