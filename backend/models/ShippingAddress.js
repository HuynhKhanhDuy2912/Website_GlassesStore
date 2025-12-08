const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShippingAddressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  recipient: { type: String, required: true },
  phone: { type: String, required: true },

  address_line: { type: String, required: true },// Tỉnh/Thành phố

  postal_code: { type: String },

  isDefault: { type: Boolean, default: false },

  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ShippingAddress', ShippingAddressSchema);
