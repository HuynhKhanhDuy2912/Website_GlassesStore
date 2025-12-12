const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  username: { 
    type: String,
    required: false, 
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  // --- SỬA ĐOẠN NÀY ---
  role: {
    type: String,
    default: 'customer', 
    enum: ['customer', 'admin'], // <-- QUAN TRỌNG: Phải có 'admin'
  },
  // --------------------
}, {
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);