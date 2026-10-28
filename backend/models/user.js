const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  username: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    default: ""
  },

  city: {
    type: String,
    default: ""
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  bio: {
    type: String,
    default: ""
  },

  avatar: {
    type: String,
    default: ""
  }
},
{
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);