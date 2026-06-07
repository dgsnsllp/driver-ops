<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Driver Ops - Development Instructions

## Project Overview
Driver Ops is an innovative platform that digitizes communication between vehicle owners and the outside world while providing data-driven fleet management for companies. The project consists of two main modules:

1. **Individual User Module (Secure Communication)**: QR code-based anonymous communication system
2. **Corporate Fleet Module (Smart Tracking and Analysis)**: Fleet management and driver performance tracking

## Technology Stack
- **Backend**: Node.js, Express.js, Socket.io
- **Frontend**: React 18, Recharts, Lucide React
- **Database**: MongoDB (configurable)
- **Real-time**: Socket.io
- **QR Codes**: qrcode library

## Project Structure
```
driver-ops/
├── backend/              # Express.js API
│   ├── config/          # Configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   └── server.js        # Main server file
├── frontend/            # React Dashboard
│   ├── public/
│   ├── src/
│   │   ├── api/        # API calls
│   │   ├── components/ # React components
│   │   ├── pages/      # Pages
│   │   └── styles/     # CSS files
└── package.json
```

## Installation & Setup

### Install all dependencies
```bash
npm run install-all
```

### Start Backend (Terminal 1)
```bash
npm run backend
```
Server will run on `http://localhost:5000`

### Start Frontend (Terminal 2)
```bash
npm run frontend
```
Application will open at `http://localhost:3000`

### Start Both
```bash
npm run dev
```

## Development Guidelines

### Backend Development
- Add new API endpoints in `/backend/routes/`
- Implement business logic in `/backend/controllers/`
- Define data schemas in `/backend/models/`
- Use Socket.io for real-time notifications

### Frontend Development
- Create reusable components in `/frontend/src/components/`
- Add new pages in `/frontend/src/pages/`
- Use Axios for API calls
- Update styles in `/frontend/src/styles/`

### Code Standards
- Use consistent naming conventions
- Write comments for complex logic
- Keep components small and reusable
- Maintain responsive design

## Available API Endpoints

- `GET /api/dashboard` - Dashboard statistics
- `GET /api/drivers` - List all drivers
- `GET /api/notifications` - Get notifications
- `GET /api/notification-trend` - 30-day trend
- `GET /api/qr/:driverId` - Generate QR code

## Features

### Dashboard
- Real-time statistics
- Notification trends
- Driver performance metrics
- System status monitoring

### Drivers Management
- Driver list view
- Performance tracking
- Vehicle information
- Status monitoring

### Notifications
- Real-time alerts
- Incoming intel feed
- Message history
- Priority categorization

## Key Features to Implement

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication
- [ ] QR code generation for vehicles
- [ ] Advanced reporting
- [ ] Mobile app integration
- [ ] Email notifications
- [ ] Data export functionality

## Troubleshooting

### Backend not starting
- Check if port 5000 is available
- Verify Node.js is installed
- Check `.env` file configuration

### Frontend not connecting to backend
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify `REACT_APP_API_URL` in `.env`

### Dependencies not installing
- Delete `node_modules` and `package-lock.json`
- Run `npm cache clean --force`
- Run `npm run install-all` again

## Git Workflow

1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -m 'Add feature'`
3. Push to branch: `git push origin feature/feature-name`
4. Create Pull Request

## Performance Optimization

- Use React.memo for expensive components
- Implement lazy loading for routes
- Optimize API calls with caching
- Monitor bundle size

## Testing

Run tests with:
```bash
npm test
```

## Deployment

Backend deployment: [To be configured]
Frontend deployment: [To be configured]

---

Last Updated: June 5, 2026
