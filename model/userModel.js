import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter Your Name"],
    maxLength: [30, "Name must be 30 characters"],
    minLength: [3, "Name atleast have 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Please enter Your email"],
    unique: true,
    validator: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter Your Password"],
    minLength: [8, "Password must be at least 8 characters"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  role: {
    type: String,
    default: "user",
  },
  resetPasswordOTP: Number,
  resetPasswordOTPExpiry: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.getJWTToken = function (params) {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET);
};

const User = mongoose.model("User", userSchema);

export default User;
