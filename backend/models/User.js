const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthday: { type: Date },
  gender: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
favorites: [
  {
    id: { type: String, required: true },
    type: { type: String, enum: ["movie", "tv"], required: true },
  },
],
wishlist: [
  {
    id: { type: String, required: true },
    type: { type: String, enum: ["movie", "tv"], required: true },
  },
],
likes: [
  {
    id: { type: String, required: true },
    type: { type: String, enum: ["movie", "tv"], required: true },
  },
],

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);