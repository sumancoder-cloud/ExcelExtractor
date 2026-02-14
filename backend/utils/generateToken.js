const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Long expiry - actual logout controlled by inactivity timer
  });
};

module.exports = generateToken;
