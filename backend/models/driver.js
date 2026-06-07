const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vehicle: { type: String, default: 'Atanmadı' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
