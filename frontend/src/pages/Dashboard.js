import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import DriverRanking from '../components/DriverRanking';
import IncomingIntel from '../components/IncomingIntel';
import { Truck, Users, Bell, CheckCircle } from 'lucide-react';
import '../styles/Dashboard.css';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [driverRanking, setDriverRanking] = useState([]);
  const [incomingNotifications, setIncomingNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const [dashRes, rankRes, notifRes] = await Promise.all([
        axios.get(`https://driver-ops.onrender.com/api/dashboard?ownerId=${userId}`),
        axios.get(`https://driver-ops.onrender.com/api/drivers/ranking?ownerId=${userId}`),
        axios.get(`https://driver-ops.onrender.com/api/notifications?ownerId=${userId}`)
      ]);
      
      setDashboardData(dashRes.data);
      setDriverRanking(rankRes.data);
      setIncomingNotifications(notifRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleMarkRead = async (notifId) => {
    try {
      await axios.put(`https://driver-ops.onrender.com/api/notifications/${notifId}/read`);
      // Update local state to immediately show it as read
      setIncomingNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
      // Refresh dashboard stats to update unread count
      fetchDashboardData();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="dashboard" style={{ marginLeft: sidebarCollapsed ? '72px' : '240px', transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <Sidebar onToggle={(collapsed) => setSidebarCollapsed(collapsed)} />
      <main className="dashboard-main">
        <h1>KONTROL PANELİ</h1>
        
        <div className="stats-grid">
          <StatCard
            title="TOPLAM FİLO BÜYÜKLÜĞÜ"
            value={dashboardData?.totalFleet}
            icon={<Truck size={32} />}
          />
          <StatCard
            title="AKTİF SÜRÜCÜLER"
            value={dashboardData?.activeDrivers}
            icon={<Users size={32} />}
          />
          <StatCard
            title="OKUNMAMIŞ BİLDİRİMLER"
            value={dashboardData?.unreadIntel}
            icon={<Bell size={32} />}
          />
          <StatCard
            title="SİSTEM DURUMU"
            value={dashboardData?.systemStatus}
            icon={<CheckCircle size={32} />}
          />
        </div>

        <div className="dashboard-content">
          <DriverRanking ranking={driverRanking} />
          <IncomingIntel notifications={incomingNotifications} onMarkRead={handleMarkRead} />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
