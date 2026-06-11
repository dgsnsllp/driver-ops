require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

// Models
const Driver = require('./models/driver');
const Vehicle = require('./models/Vehicle');
const Notification = require('./models/notification');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'driverops-secret-key-2026';

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Atlas connected successfully!');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
};

// Notification Trend (static for now)
const notificationTrend = [
  { date: '2026-05-31', count: 1 },
  { date: '2026-06-01', count: 1.2 },
  { date: '2026-06-02', count: 1.8 },
  { date: '2026-06-03', count: 1.9 },
  { date: '2026-06-04', count: 1.5 },
  { date: '2026-06-05', count: 1 }
];

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kayıtlı!' });
    }

    const user = await User.create({ name, email, password, userType });
    const token = jwt.sign({ id: user._id, userType: user.userType }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, userType: user.userType, onboardingCompleted: user.onboardingCompleted }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Bu e-posta adresi kayıtlı değil!' });
    }

    if (user.userType !== userType) {
      return res.status(401).json({ error: 'Bu hesap seçtiğiniz türe ait değil! Lütfen doğru girişi (Bireysel/Şirket) seçin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Şifre hatalı!' });
    }

    const token = jwt.sign({ id: user._id, userType: user.userType }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, userType: user.userType, onboardingCompleted: user.onboardingCompleted }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot Password (reset)
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı!' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Şifreniz başarıyla güncellendi!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Onboarding
app.post('/api/auth/onboarding', async (req, res) => {
  try {
    const { userId, phone, companyName, plate, model, year, maintenanceDate } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı!' });
    }

    user.phone = phone;
    user.onboardingCompleted = true;

    if (user.userType === 'corporate') {
      user.companyName = companyName;
      await user.save();
    } else {
      await user.save();
      
      // Individual: Create Driver and Vehicle records
      const newDriver = await Driver.create({
        name: user.name,
        vehicle: model,
        status: 'active',
        ownerId: user._id
      });

      await Vehicle.create({
        plate,
        model,
        year: parseInt(year),
        status: 'Aktif',
        driverId: newDriver._id,
        driverName: newDriver.name,
        maintenanceDate: maintenanceDate || '',
        ownerId: user._id
      });
    }

    res.json({ message: 'Profil başarıyla tamamlandı.', user: { id: user._id, onboardingCompleted: true } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Current User Profile Data
app.get('/api/users/me/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    
    let driverInfo = null;
    let vehicleInfo = null;
    
    if (user.userType === 'individual') {
      driverInfo = await Driver.findOne({ name: user.name });
      if (driverInfo) {
        vehicleInfo = await Vehicle.findOne({ driverId: driverInfo._id });
      }
    }
    
    res.json({
      user,
      driver: driverInfo,
      vehicle: vehicleInfo
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update User Profile
app.put('/api/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== DATA ROUTES ====================

// Dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    const query = req.query.ownerId ? { ownerId: req.query.ownerId } : {};
    
    const totalFleet = await Vehicle.countDocuments(query);
    const activeDrivers = await Driver.countDocuments({ ...query, status: 'active' });
    const unreadIntel = await Notification.countDocuments({ ...query, isRead: false });
    
    res.json({
      totalFleet,
      activeDrivers,
      unreadIntel,
      systemStatus: 'Optimal'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Drivers - List
app.get('/api/drivers', async (req, res) => {
  try {
    const query = req.query.ownerId ? { ownerId: req.query.ownerId } : {};
    const drivers = await Driver.find(query);
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Drivers - Create
app.post('/api/drivers', async (req, res) => {
  try {
    const newDriver = await Driver.create(req.body);
    res.status(201).json(newDriver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Drivers - Update
app.put('/api/drivers/:id', async (req, res) => {
  try {
    const updatedDriver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedDriver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Drivers - Delete
app.delete('/api/drivers/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Sürücü bulunamadı' });
    }

    // Sync: clear the vehicle's driver info
    await Vehicle.updateMany({ driverId: req.params.id }, { driverId: null, driverName: 'Atanmadı' });

    await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sürücü silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const query = req.query.ownerId ? { ownerId: req.query.ownerId } : {};
    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark Notification as Read
app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id, 
      { isRead: true }, 
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Driver Ranking (Leaderboard) based on Notification counts
app.get('/api/drivers/ranking', async (req, res) => {
  try {
    let query = {};
    if (req.query.ownerId && mongoose.isValidObjectId(req.query.ownerId)) {
      query = { ownerId: new mongoose.Types.ObjectId(req.query.ownerId) };
    }
    
    const ranking = await Notification.aggregate([
      { $match: query },
      { $group: { _id: "$driver", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    const formattedRanking = ranking.map(r => ({
      driverName: r._id,
      penaltyCount: r.count
    }));
    
    res.json(formattedRanking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vehicles - List
app.get('/api/vehicles', async (req, res) => {
  try {
    const query = req.query.ownerId ? { ownerId: req.query.ownerId } : {};
    const vehicles = await Vehicle.find(query);
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vehicles - Create
app.post('/api/vehicles', async (req, res) => {
  try {
    const { driverId, ...rest } = req.body;

    const vehicleData = {
      ...rest,
      driverId: driverId || null,
      driverName: 'Atanmadı'
    };

    // Sync: update the selected driver's vehicle field
    if (driverId) {
      const driver = await Driver.findById(driverId);
      if (driver) {
        driver.vehicle = rest.model;
        await driver.save();
        vehicleData.driverName = driver.name;
      }
    }

    const newVehicle = await Vehicle.create(vehicleData);
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vehicles - Update
app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Sync driver model if vehicle model changes
    if (req.body.model && updatedVehicle.driverId) {
      await Driver.findByIdAndUpdate(updatedVehicle.driverId, { vehicle: req.body.model });
    }
    
    res.json(updatedVehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vehicles - Delete
app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    // Sync: clear the driver's vehicle field
    if (vehicle.driverId) {
      const driver = await Driver.findById(vehicle.driverId);
      if (driver) {
        driver.vehicle = 'Atanmadı';
        await driver.save();
      }
    }

    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Araç silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vehicles - Search by Plate
app.get('/api/vehicles/search', async (req, res) => {
  try {
    const { plate } = req.query;
    if (!plate) return res.status(400).json({ error: 'Plaka gerekli' });
    
    // Harfleri/rakamları ayırıp aralarına opsiyonel boşluk (\s*) ekliyoruz
    // Örn: Kullanıcı "34ABC" yazarsa regex "3\s*4\s*A\s*B\s*C" olur ve veritabanındaki "34 ABC" ile eşleşir
    const cleanPlate = plate.replace(/\s+/g, '');
    const regexPattern = cleanPlate.split('').join('\\s*');
    
    const vehicle = await Vehicle.findOne({ 
      plate: { $regex: new RegExp(`^\\s*${regexPattern}\\s*$`, 'i') } 
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Bu plakaya ait araç bulunamadı.' });
    }
    if (!vehicle.driverId) {
      return res.status(400).json({ error: 'Bu araca henüz bir sürücü atanmamış.' });
    }
    res.json({ driverId: vehicle.driverId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Message Revision
const aiController = require('./controllers/aiController');
app.post('/api/ai/revise', aiController.reviseMessage);

// Vehicles - Send Message
app.post('/api/vehicles/message', async (req, res) => {
  try {
    const { driverId, text, date } = req.body;
    if (!driverId || !text) {
      return res.status(400).json({ error: 'Eksik bilgi' });
    }
    
    const vehicle = await Vehicle.findOne({ driverId });
    if (!vehicle) {
      return res.status(404).json({ error: 'Bu sürücüye ait araç bulunamadı.' });
    }

    vehicle.messages.push({ text, date: date || new Date().toLocaleString('tr-TR') });
    await vehicle.save();
    
    // Create a global notification
    await Notification.create({
      driver: vehicle.driverName,
      message: text,
      date: date || new Date().toLocaleDateString('tr-TR'),
      type: 'warning',
      ownerId: vehicle.ownerId // Assign to vehicle's owner
    });

    res.json({ message: 'Mesaj başarıyla gönderildi.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vehicles - Reply to Message
app.post('/api/vehicles/message/reply', async (req, res) => {
  try {
    const { driverId, messageId, replyText, date } = req.body;
    if (!driverId || messageId === undefined || !replyText) {
      return res.status(400).json({ error: 'Eksik bilgi' });
    }
    
    const vehicle = await Vehicle.findOne({ driverId });
    if (!vehicle) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    const msg = vehicle.messages.find((m, idx) => m._id.toString() === messageId.toString() || idx.toString() === messageId.toString());
    
    if (!msg) {
      return res.status(404).json({ error: 'Mesaj bulunamadı' });
    }

    msg.reply = replyText;
    msg.replyDate = date || new Date().toLocaleString('tr-TR');
    
    await vehicle.save();
    res.json({ message: 'Yanıt başarıyla kaydedildi.', vehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// QR Code
app.get('/api/qr/:driverId', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.driverId);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json({
      driverId: driver._id,
      driverName: driver.name,
      vehicle: driver.vehicle,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DRIVER-${driver._id}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Socket.io for Real-time Notifications
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('notify', (data) => {
    console.log('Notification received:', data);
    io.emit('notification', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
