import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import '../styles/NotificationsPage.css';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`http://localhost:5000/api/notifications?ownerId=${userId}`);
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="dashboard" style={{ marginLeft: sidebarCollapsed ? '72px' : '240px', transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <Sidebar onToggle={(collapsed) => setSidebarCollapsed(collapsed)} />
      <main className="notifications-main">
        <h1>NOTIFICATIONS</h1>
        <div className="notifications-list">
          {notifications.map((notif) => (
            <div key={notif.id} className="notification-item">
              <h3>{notif.driver}</h3>
              <p>{notif.message}</p>
              <p className="date">{notif.date}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default NotificationsPage;
