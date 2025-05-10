const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  birthday: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  wishlist: [String],
likes: [String],
favorites: [String],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
