const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  plate: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  status: { type: String, enum: ['Aktif', 'Pasif'], default: 'Aktif' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  driverName: { type: String, default: 'Atanmadı' },
  maintenanceDate: { type: String, default: '' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messages: [{
    text: { type: String },
    date: { type: String },
    reply: { type: String, default: '' },
    replyDate: { type: String, default: '' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
