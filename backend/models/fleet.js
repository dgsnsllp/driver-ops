// Fleet Model Schema
const fleetSchema = {
  _id: String,
  companyName: String,
  adminId: String,
  totalVehicles: Number,
  activeDrivers: Number,
  totalNotifications: Number,
  averagePerformanceScore: Number,
  createdAt: Date,
  vehicles: [{
    vehicleId: String,
    driverId: String,
    status: String
  }]
};

module.exports = fleetSchema;
