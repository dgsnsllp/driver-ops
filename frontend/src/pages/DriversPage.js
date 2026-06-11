import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Plus, Trash2 } from 'lucide-react';
import '../styles/DriversPage.css';

function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', status: 'active' });
  const [driverToDelete, setDriverToDelete] = useState(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`https://driver-ops.onrender.com/api/drivers?ownerId=${userId}`);
      setDrivers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setLoading(false);
    }
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      await axios.post('https://driver-ops.onrender.com/api/drivers', { ...newDriver, ownerId: userId });
      setShowAddModal(false);
      setNewDriver({ name: '', status: 'active' });
      fetchDrivers();
    } catch (error) {
      console.error('Error adding driver:', error);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await axios.put(`https://driver-ops.onrender.com/api/drivers/${id}`, { status: newStatus });
      setDrivers(drivers.map(d => d._id === id ? { ...d, status: newStatus } : d));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteDriver = (id) => {
    setDriverToDelete(id);
  };

  const confirmDeleteDriver = async () => {
    if (!driverToDelete) return;
    try {
      await axios.delete(`https://driver-ops.onrender.com/api/drivers/${driverToDelete}`);
      setDrivers(drivers.filter(d => d._id !== driverToDelete));
      setDriverToDelete(null);
    } catch (error) {
      console.error('Error deleting driver:', error);
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  const driversWithVehicle = drivers.filter(d => d.vehicle && d.vehicle !== 'Atanmadı');
  const driversWithoutVehicle = drivers.filter(d => !d.vehicle || d.vehicle === 'Atanmadı');

  const renderDriverCard = (driver) => (
    <div key={driver._id} className="driver-card">
      <div className="driver-card-header">
        <h3>{driver.name}</h3>
        <button className="delete-btn" onClick={() => handleDeleteDriver(driver._id)} title="Sil">
          <Trash2 size={18} />
        </button>
      </div>
      <p>Araç: {driver.vehicle && driver.vehicle !== 'Atanmadı' ? driver.vehicle : <span className="no-vehicle">Atanmadı</span>}</p>
      <div className="status-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
        <p style={{ marginBottom: 0 }}>Durum: <span className={`status ${driver.status}`}>{driver.status === 'active' ? 'Aktif' : 'Pasif'}</span></p>
        <button 
          className="toggle-status-btn"
          onClick={() => handleToggleStatus(driver._id, driver.status)}
          style={{ background: 'transparent', border: '1px solid #00d4ff', color: '#00d4ff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
        >
          {driver.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard" style={{ marginLeft: sidebarCollapsed ? '72px' : '240px', transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <Sidebar onToggle={(collapsed) => setSidebarCollapsed(collapsed)} />
      <main className="drivers-main">
        <div className="page-header">
          <h1>SÜRÜCÜLER</h1>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={20} />
            <span>Yeni Sürücü Ekle</span>
          </button>
        </div>
        
        <div className="drivers-layout">
          <div className="drivers-column active-column">
            <h2>Araç Tanımlı Sürücüler</h2>
            <div className="drivers-list">
              {driversWithVehicle.length > 0 ? (
                driversWithVehicle.map(renderDriverCard)
              ) : (
                <p className="empty-column-text">Araç atanmış sürücü bulunmuyor.</p>
              )}
            </div>
          </div>
          
          <div className="drivers-column passive-column">
            <h2>Araç Tanımlanmamış Sürücüler</h2>
            <div className="drivers-list">
              {driversWithoutVehicle.length > 0 ? (
                driversWithoutVehicle.map(renderDriverCard)
              ) : (
                <p className="empty-column-text">Tüm sürücülere araç atanmış.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Yeni Sürücü Ekle</h2>
            <form onSubmit={handleAddDriver} className="driver-form">
              <div className="form-group">
                <label>Ad Soyad</label>
                <input 
                  type="text" 
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({...newDriver, name: e.target.value})}
                  required 
                  placeholder="Örn: Ahmet Yılmaz"
                />
              </div>
              <div className="form-group">
                <label>Durum</label>
                <select 
                  value={newDriver.status}
                  onChange={(e) => setNewDriver({...newDriver, status: e.target.value})}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>İptal</button>
                <button type="submit" className="save-btn">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {driverToDelete && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirm-modal">
            <h2>Sürücüyü Sil</h2>
            <p>Bu sürücüyü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setDriverToDelete(null)}>İptal</button>
              <button className="delete-confirm-btn" onClick={confirmDeleteDriver}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriversPage;
