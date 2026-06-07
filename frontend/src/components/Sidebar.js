import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Bell, QrCode, User, LogOut, ChevronLeft, ChevronRight, Truck } from 'lucide-react';
import '../styles/Sidebar.css';

function Sidebar({ onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    if (onToggle) onToggle(newState);
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const userType = localStorage.getItem('userType');

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-toggle-btn" onClick={handleToggle}>
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </div>

      <div className="logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <circle cx="12" cy="11" r="3"></circle>
        </svg>
        {!collapsed && <span className="logo-text">SÜRÜCÜ OPS</span>}
      </div>
      
      <nav className="sidebar-nav">
        {userType === 'individual' ? (
          <>
            <button 
              className={`nav-item ${isActive('/user-panel') ? 'active' : ''}`}
              onClick={() => navigate('/user-panel')}
              title="Profil"
            >
              <User size={20} />
              {!collapsed && <span>Profil</span>}
            </button>
            
            <button 
              className={`nav-item ${isActive('/qr-scanner') ? 'active' : ''}`}
              onClick={() => navigate('/qr-scanner')}
              title="QR Kodum"
            >
              <QrCode size={20} />
              {!collapsed && <span>QR Kodum</span>}
            </button>
          </>
        ) : (
          <>
            <button 
              className={`nav-item ${isActive('/') ? 'active' : ''}`}
              onClick={() => navigate('/')}
              title="Genel Bakış"
            >
              <Home size={20} />
              {!collapsed && <span>Genel Bakış</span>}
            </button>
            
            <button 
              className={`nav-item ${isActive('/drivers') ? 'active' : ''}`}
              onClick={() => navigate('/drivers')}
              title="Sürücüler"
            >
              <Users size={20} />
              {!collapsed && <span>Sürücüler</span>}
            </button>
            
            <button 
              className={`nav-item ${isActive('/vehicles') ? 'active' : ''}`}
              onClick={() => navigate('/vehicles')}
              title="Araçlar"
            >
              <Truck size={20} />
              {!collapsed && <span>Araçlar</span>}
            </button>
            
            <button 
              className={`nav-item ${isActive('/notifications') ? 'active' : ''}`}
              onClick={() => navigate('/notifications')}
              title="Bildirimler"
            >
              <Bell size={20} />
              {!collapsed && <span>Bildirimler</span>}
            </button>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout} title="Çıkış Yap">
          <LogOut size={18} />
          {!collapsed && <span>Çıkış Yap</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
