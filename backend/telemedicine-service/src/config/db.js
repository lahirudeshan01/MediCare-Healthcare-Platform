const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing. Set it in your .env file.');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Telemedicine DB Connected');
  } catch (error) {
    console.error('Failed to connect Telemedicine DB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
