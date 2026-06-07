require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Driver = require('./models/driver');
const Vehicle = require('./models/Vehicle');
const Notification = require('./models/notification');

const seedDemo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB bağlandı...');

    // Varsa eski demo kullanıcıları sil
    await User.deleteMany({ email: { $in: ['demo@user.com', 'demo@company.com'] } });

    // 1. Bireysel demo kullanıcı
    const individualUser = await User.create({
      name: 'Demo Kullanıcı',
      email: 'demo@user.com',
      password: '123456',
      userType: 'individual',
      phone: '0555 123 4567',
      onboardingCompleted: true,
    });
    console.log('✅ Bireysel kullanıcı oluşturuldu:', individualUser.email);

    // Bireysel kullanıcı için sürücü & araç kaydı
    const demoDriver = await Driver.create({
      name: 'Demo Kullanıcı',
      vehicle: 'Toyota Corolla',
      status: 'active',
      ownerId: individualUser._id,
    });

    await Vehicle.create({
      plate: '34 DEMO 001',
      model: 'Toyota Corolla',
      year: 2022,
      status: 'Aktif',
      driverId: demoDriver._id,
      driverName: demoDriver.name,
      maintenanceDate: '2026-09-01',
      ownerId: individualUser._id,
    });
    console.log('✅ Bireysel araç & sürücü kaydı oluşturuldu.');

    // 2. Şirket demo kullanıcısı
    const corporateUser = await User.create({
      name: 'Demo Şirket',
      email: 'demo@company.com',
      password: '123456',
      userType: 'corporate',
      phone: '0212 000 0000',
      companyName: 'Demo Lojistik A.Ş.',
      onboardingCompleted: true,
    });
    console.log('✅ Şirket kullanıcısı oluşturuldu:', corporateUser.email);

    // Şirket için araç filolu
    const drivers = await Driver.insertMany([
      { name: 'Ahmet Yılmaz', vehicle: 'Ford Transit', status: 'active', ownerId: corporateUser._id },
      { name: 'Mehmet Demir', vehicle: 'Mercedes Sprinter', status: 'active', ownerId: corporateUser._id },
      { name: 'Ali Kaya', vehicle: 'Renault Master', status: 'inactive', ownerId: corporateUser._id },
    ]);

    await Vehicle.insertMany([
      { plate: '34 ABC 001', model: 'Ford Transit', year: 2023, status: 'Aktif', driverId: drivers[0]._id, driverName: drivers[0].name, ownerId: corporateUser._id },
      { plate: '34 DEF 002', model: 'Mercedes Sprinter', year: 2022, status: 'Aktif', driverId: drivers[1]._id, driverName: drivers[1].name, ownerId: corporateUser._id },
      { plate: '34 GHI 003', model: 'Renault Master', year: 2021, status: 'Pasif', driverId: drivers[2]._id, driverName: drivers[2].name, ownerId: corporateUser._id },
    ]);
    console.log('✅ Şirket araç & sürücü kayıtları oluşturuldu.');

    // Bildirimler
    await Notification.insertMany([
      { driver: drivers[0].name, message: 'Hız ihlali tespit edildi – 120km/h', date: '07.06.2026', type: 'warning', isRead: false, ownerId: corporateUser._id },
      { driver: drivers[1].name, message: 'Periyodik bakım zamanı geldi', date: '06.06.2026', type: 'info', isRead: false, ownerId: corporateUser._id },
      { driver: drivers[2].name, message: 'Araç park ihlali raporu', date: '05.06.2026', type: 'penalty', isRead: true, ownerId: corporateUser._id },
    ]);
    console.log('✅ Örnek bildirimler oluşturuldu.');

    console.log('\n🎉 Demo verileri başarıyla yüklendi!');
    console.log('📧 Bireysel giriş: demo@user.com / 123456');
    console.log('📧 Şirket girişi: demo@company.com / 123456');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed hatası:', err.message);
    process.exit(1);
  }
};

seedDemo();
