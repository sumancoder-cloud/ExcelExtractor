const express = require('express');
const router = express.Router();
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { sendEmail, sendEmailWithOTP } = require('../utils/sendEmail');

// Configure Passport Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:5000'}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.isVerified = true; // Google accounts are pre-verified
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          fullName: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          isVerified: true, // Google accounts are pre-verified
          password: Math.random().toString(36) + Date.now().toString(), // Random password for Google users
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const token = generateToken(req.user._id);

      // Set token in cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Redirect to frontend with success
      res.redirect(`${process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:5174'}/login?google=success&token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:5174'}/login?google=error`);
    }
  }
);

// @route   POST /api/auth/google-login
// @desc    Handle Google OAuth login from frontend
// @access  Public
router.post('/google-login', async (req, res) => {
  try {
    const { googleId, email, fullName, picture } = req.body;

    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId });

    if (user) {
      const token = generateToken(user._id);
      
      // Set token in cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return res.json({
        success: true,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
        token,
      });
    }

    // Check if user exists with same email
    user = await User.findOne({ email });

    if (user) {
      // Link Google account to existing user
      user.googleId = googleId;
      user.isVerified = true;
      await user.save();
      
      const token = generateToken(user._id);
      
      // Set token in cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return res.json({
        success: true,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
        token,
      });
    }

    // Create new user
    user = await User.create({
      fullName,
      email,
      googleId,
      isVerified: true,
      password: Math.random().toString(36) + Date.now().toString(), // Random password
    });

    const token = generateToken(user._id);

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during Google login' 
    });
  }
});

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
    });

    if (user) {
      const token = generateToken(user._id);
      
      // Set token in cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(201).json({
        success: true,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
        token,
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error during signup' 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const token = generateToken(user._id);

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login. Please make sure MongoDB is running.' 
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user / clear cookie
// @access  Public
router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @route   GET /api/auth/validate
// @desc    Validate JWT token
// @access  Private
router.get('/validate', protect, async (req, res) => {
  try {
    // The auth middleware should have already validated the token
    // If we reach here, the token is valid
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      valid: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token validation'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset OTP to email
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP for storage
    const crypto = require('crypto');
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    user.resetOTP = otpHash;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();

    // Send OTP via email
    try {
      await sendEmailWithOTP(email, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please check your email address or try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please check your inbox and spam folder.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing password reset request'
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP before password reset
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const crypto = require('crypto');
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetOTP: otpHash,
      resetOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // OTP verified successfully
    res.status(200).json({
      success: true,
      message: 'OTP verified. You can now reset your password.',
      verified: true
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with OTP verification
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const crypto = require('crypto');
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetOTP: otpHash,
      resetOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    // Update password
    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Full name and email are required'
      });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: req.user.id }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, email: email.toLowerCase() },
      { new: true, runValidators: true }
    ).select('-password -passwordResetToken -passwordResetExpires');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change password (for logged-in users)
// @access  Private
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user.id);

    // Check if current password is correct
    const isPasswordMatch = await user.matchPassword(currentPassword);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
});

module.exports = router;
