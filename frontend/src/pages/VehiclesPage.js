import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Plus, Search, Truck, Trash2, MessageSquare, X, QrCode } from 'lucide-react';
import '../styles/VehiclesPage.css';

function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [qrVehicle, setQrVehicle] = useState(null);
  
  const [newVehicle, setNewVehicle] = useState({
    plate: '',
    model: '',
    year: '',
    status: 'Aktif',
    driverId: '',
    maintenanceDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const [vehiclesRes, driversRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/vehicles?ownerId=${userId}`),
        axios.get(`http://localhost:5000/api/drivers?ownerId=${userId}`)
      ]);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      const payload = {
        ...newVehicle,
        year: parseInt(newVehicle.year, 10),
        ownerId: userId
      };

      await axios.post('http://localhost:5000/api/vehicles', payload);
      const vehiclesRes = await axios.get(`http://localhost:5000/api/vehicles?ownerId=${userId}`);
      setVehicles(vehiclesRes.data);
      const driversRes = await axios.get(`http://localhost:5000/api/drivers?ownerId=${userId}`);
      setDrivers(driversRes.data);
      setShowAddModal(false);
      setNewVehicle({ plate: '', model: '', year: '', status: 'Aktif', driverId: '', maintenanceDate: '' });
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  const handleDeleteVehicle = (id) => {
    setVehicleToDelete(id);
  };

  const confirmDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    try {
      const userId = localStorage.getItem('userId');
      await axios.delete(`http://localhost:5000/api/vehicles/${vehicleToDelete}`);
      
      const vehiclesRes = await axios.get(`http://localhost:5000/api/vehicles?ownerId=${userId}`);
      setVehicles(vehiclesRes.data);
      const driversRes = await axios.get(`http://localhost:5000/api/drivers?ownerId=${userId}`);
      setDrivers(driversRes.data);
      setVehicleToDelete(null);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const openMessages = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowMessagesModal(true);
  };

  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.driverName && v.driverName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="vehicles-page" style={{ marginLeft: sidebarCollapsed ? '72px' : '240px', transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <Sidebar onToggle={(collapsed) => setSidebarCollapsed(collapsed)} />
      
      <main className="vehicles-main">
        <div className="page-header">
          <div className="header-title">
            <Truck size={32} className="header-icon" />
            <h1>ARAÇLAR</h1>
          </div>
          <button className="add-vehicle-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={20} />
            <span>Yeni Araç Ekle</span>
          </button>
        </div>

        <div className="vehicles-controls">
          <div className="search-box">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Plaka, model veya sürücü ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading">Yükleniyor...</div>
        ) : (
          <div className="vehicles-table-container">
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>Plaka</th>
                  <th>Marka/Model</th>
                  <th>Yıl</th>
                  <th>Sürücü</th>
                  <th>Sonraki Bakım</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map(vehicle => (
                    <tr key={vehicle._id}>
                      <td className="plate-cell">{vehicle.plate}</td>
                      <td>{vehicle.model}</td>
                      <td>{vehicle.year}</td>
                      <td>{vehicle.driverName || 'Atanmadı'}</td>
                      <td>
                        {vehicle.maintenanceDate ? new Date(vehicle.maintenanceDate).toLocaleDateString('tr-TR') : 'Belirtilmedi'}
                      </td>
                      <td>
                        <span className={`status-badge ${vehicle.status.toLowerCase() === 'aktif' ? 'active' : 'inactive'}`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button className="action-btn qr-btn" title="QR Kod" onClick={() => setQrVehicle(vehicle)}>
                          <QrCode size={18} />
                        </button>
                        <button className="action-btn message-btn" title="Mesajlar" onClick={() => openMessages(vehicle)}>
                          <MessageSquare size={18} />
                        </button>
                        <button className="action-btn delete-btn" title="Sil" onClick={() => handleDeleteVehicle(vehicle._id)}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">Araç bulunamadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Yeni Araç Ekle</h2>
            <form onSubmit={handleAddVehicle} className="vehicle-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Plaka</label>
                  <input 
                    type="text" 
                    value={newVehicle.plate}
                    onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value})}
                    required 
                    placeholder="34 ABC 123"
                  />
                </div>
                <div className="form-group">
                  <label>Sürücü</label>
                  <select
                    value={newVehicle.driverId}
                    onChange={(e) => setNewVehicle({...newVehicle, driverId: e.target.value})}
                  >
                    <option value="">Sürücü Seçiniz</option>
                    {drivers.map(driver => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Marka/Model</label>
                  <input 
                    type="text" 
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                    required 
                    placeholder="Toyota Corolla"
                  />
                </div>
                <div className="form-group">
                  <label>Yıl</label>
                  <input 
                    type="number" 
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
                    required 
                    placeholder="2023"
                    min="1990"
                    max="2030"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sonraki Bakım Tarihi</label>
                  <input 
                    type="date" 
                    value={newVehicle.maintenanceDate}
                    onChange={(e) => setNewVehicle({...newVehicle, maintenanceDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Durum</label>
                  <select 
                    value={newVehicle.status}
                    onChange={(e) => setNewVehicle({...newVehicle, status: e.target.value})}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Pasif">Pasif</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>İptal</button>
                <button type="submit" className="save-btn">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Messages Modal */}
      {showMessagesModal && selectedVehicle && (
        <div className="modal-overlay" onClick={() => setShowMessagesModal(false)}>
          <div className="modal-content messages-modal" onClick={e => e.stopPropagation()}>
            <div className="messages-header">
              <h2>{selectedVehicle.plate} - Mesajlar</h2>
              <button className="close-btn" onClick={() => setShowMessagesModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="messages-body">
              {selectedVehicle.messages && selectedVehicle.messages.length > 0 ? (
                <div className="messages-list">
                  {selectedVehicle.messages.map(msg => (
                    <div key={msg._id} className="message-item">
                      <div className="message-date">{msg.date}</div>
                      <div className="message-text">{msg.text}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-messages">
                  <MessageSquare size={48} className="no-messages-icon" />
                  <p>Bu araca ait henüz mesaj bulunmamaktadır.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrVehicle && (
        <div className="modal-overlay" onClick={() => setQrVehicle(null)}>
          <div className="modal-content messages-modal" onClick={e => e.stopPropagation()}>
            <div className="messages-header">
              <h2>{qrVehicle.plate} - QR Kod</h2>
              <button className="close-btn" onClick={() => setQrVehicle(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="messages-body qr-modal-body">
              {qrVehicle.driverId ? (
                <>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`http://localhost:3000/report/${qrVehicle.driverId}`)}`}
                    alt="QR Kod"
                    className="qr-img"
                  />
                  <p>Sürücü bildirimi oluşturmak için bu kodu taratın</p>
                  <a 
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`http://localhost:3000/report/${qrVehicle.driverId}`)}`}
                    download={`QR_${qrVehicle.plate}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="save-btn download-link"
                  >
                    Kodu İndir / Büyüt
                  </a>
                </>
              ) : (
                <div className="no-messages">
                  <QrCode size={48} className="no-messages-icon" />
                  <p style={{ color: '#f87171' }}>Bu araca bir sürücü atanmadığı için QR kod oluşturulamıyor.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {vehicleToDelete && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirm-modal">
            <h2>Aracı Sil</h2>
            <p>Bu aracı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setVehicleToDelete(null)}>İptal</button>
              <button className="delete-confirm-btn" onClick={confirmDeleteVehicle}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default VehiclesPage;
