const mongoose = require('mongoose');
require('dotenv').config();

async function deleteUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = require('./models/User');
    const result = await User.deleteOne({ email: 'testuser@gmail.com' });
    console.log('User deleted:', result);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

deleteUser();
