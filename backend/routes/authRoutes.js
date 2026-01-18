const express = require('express');
const router = express.Router();
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

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

module.exports = router;
