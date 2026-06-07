import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DriversPage from './pages/DriversPage';
import VehiclesPage from './pages/VehiclesPage';
import NotificationsPage from './pages/NotificationsPage';
import IndividualUserPanel from './pages/IndividualUserPanel';
import QRScanner from './pages/QRScanner';
import ReportPage from './pages/ReportPage';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import './styles/App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

// Onboarding Route Component
function OnboardingRoute({ children }) {
  const token = localStorage.getItem('token');
  const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (onboardingCompleted) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/drivers" element={<ProtectedRoute><DriversPage /></ProtectedRoute>} />
        <Route path="/vehicles" element={<ProtectedRoute><VehiclesPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/user-panel" element={<ProtectedRoute><IndividualUserPanel /></ProtectedRoute>} />
        <Route path="/qr-scanner" element={<ProtectedRoute><QRScanner /></ProtectedRoute>} />
        <Route path="/report/:driverId" element={<ReportPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
