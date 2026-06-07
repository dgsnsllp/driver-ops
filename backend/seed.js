require('dotenv').config();
const mongoose = require('mongoose');
const Driver = require('./models/driver');
const Vehicle = require('./models/Vehicle');
const Notification = require('./models/notification');
const User = require('./models/User');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear ALL data
    await Driver.deleteMany({});
    await Vehicle.deleteMany({});
    await Notification.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Tüm veriler silindi (sıfırlandı).');

    console.log('\n✅ Veritabanı tamamen temizlendi!');
    console.log('Artık uygulamaya kayıt olarak giriş yapabilirsiniz.');
    process.exit(0);
  } catch (err) {
    console.error('Seed hatası:', err.message);
    process.exit(1);
  }
};

seedDB();
