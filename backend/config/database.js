const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  console.log('DB connected');
};
