const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  driver: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
