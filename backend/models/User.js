const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: function() {
      // Password is required only if not using Google OAuth
      return !this.googleId;
    },
    minlength: [6, 'Password must be at least 6 characters'],
  },
  googleId: {
    type: String,
    sparse: true, // Allows multiple null values but unique non-null values
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  passwordResetToken: {
    type: String,
    sparse: true,
  },
  passwordResetExpires: {
    type: Date,
  },
  resetOTP: {
    type: String,
    sparse: true,
  },
  resetOTPExpires: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
