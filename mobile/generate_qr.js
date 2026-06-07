const os = require('os');
const fs = require('fs');
const QRCode = require('qrcode');

const interfaces = os.networkInterfaces();
let localIp = null;
for (const name of Object.keys(interfaces)) {
  if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('ethernet')) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        localIp = net.address;
        break;
      }
    }
  }
  if (localIp) break;
}

if (!localIp) {
  // Fallback if specific interface not found
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        localIp = net.address;
      }
    }
  }
}

const expUrl = `exp://${localIp}:8081`;
console.log("Generating QR for:", expUrl);

QRCode.toFile('expo-qr.png', expUrl, {
  width: 400,
  margin: 2,
  color: {
    dark: '#00d4ff',
    light: '#ffffff'
  }
}, function (err) {
  if (err) throw err;
  console.log('QR Code generated at expo-qr.png');
});
