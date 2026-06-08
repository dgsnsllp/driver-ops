import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { QrCode, AlertCircle, Phone, Mail, MapPin, Edit3, Save, X, MessageSquare, Send, Wrench, Calendar, User, RefreshCw } from 'lucide-react';
import '../styles/IndividualUserPanel.css';

function IndividualUserPanel() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef(null);

  // İletişim bilgileri state
  const [contactEditing, setContactEditing] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: '+90 532 123 4567',
    email: 'ahmet.yilmaz@email.com',
    address: 'İstanbul, Türkiye'
  });
  const [contactDraft, setContactDraft] = useState({ ...contactInfo });

  // Araç bakım bilgileri state
  const [maintenanceEditing, setMaintenanceEditing] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState({
    plate: '34 ABC 1234',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    vin: '1234567890123456',
    lastService: '2026-05-15',
    nextService: '2026-08-15',
    km: '45.230',
    oilChange: '2026-04-10',
    tireCheck: '2026-03-20',
    brakeCheck: '2026-02-15'
  });
  const [vehicleDraft, setVehicleDraft] = useState({ ...vehicleInfo });

  // Mesajlar state — localStorage'dan yükleniyor
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [readMessages, setReadMessages] = useState(JSON.parse(localStorage.getItem('readQRMessages') || '[]'));

  // Bildirimler
  const [userNotifications, setUserNotifications] = useState([
    {
      id: 1,
      type: 'Sistem',
      message: 'Driver Ops paneline hoş geldiniz.',
      date: new Date().toLocaleDateString('tr-TR'),
      read: false
    }
  ]);

  const loadUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const res = await axios.get(`https://driver-ops.onrender.com/api/users/me/${userId}`);
      const { user, vehicle } = res.data;

      if (user) {
        const newContact = {
          phone: user.phone || 'Belirtilmedi',
          email: user.email || 'Belirtilmedi',
          address: 'Belirtilmedi'
        };
        setContactInfo(newContact);
        setContactDraft(newContact);
      }

      if (vehicle) {
        const newVehicle = {
          plate: vehicle.plate || 'Belirtilmedi',
          brand: vehicle.model ? vehicle.model.split(' ')[0] : 'Belirtilmedi',
          model: vehicle.model || 'Belirtilmedi',
          year: vehicle.year || 'Belirtilmedi',
          vin: vehicle._id || 'Belirtilmedi',
          lastService: vehicle.maintenanceDate || 'Belirtilmedi',
          nextService: 'Belirtilmedi',
          km: 'Belirtilmedi',
          oilChange: 'Belirtilmedi',
          tireCheck: 'Belirtilmedi',
          brakeCheck: 'Belirtilmedi'
        };
        setVehicleInfo(newVehicle);
        setVehicleDraft(newVehicle);

        if (vehicle.messages && vehicle.messages.length > 0) {
          const formattedMessages = vehicle.messages.map((msg, idx) => {
            const parts = (msg.date || '').split(' ');
            return {
              id: msg._id || idx,
              sender: 'Bildirim',
              text: msg.text,
              time: parts[1] || '',
              date: parts[0] || '',
              fromMe: false
            };
          });
          
          // localStorage'daki "Ben" mesajlarını da ekle
          const localStored = JSON.parse(localStorage.getItem('driverMessages') || '[]').filter(m => m.fromMe);
          
          const allMessages = [...formattedMessages, ...localStored].sort((a, b) => {
            // Basit sıralama, id'ler timestamp
            return a.id > b.id ? 1 : -1;
          });

          setMessages(allMessages);
        }
      }
    } catch (err) {
      console.error('Kullanıcı verisi alınamadı:', err);
    }
  };

  useEffect(() => {
    loadUserData();
    const interval = setInterval(loadUserData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Mesajlar değiştiğinde en alta scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages]);

  const markAsRead = (id) => {
    setUserNotifications(userNotifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  // İletişim kaydetme
  const saveContact = () => {
    setContactInfo({ ...contactDraft });
    setContactEditing(false);
  };

  const cancelContactEdit = () => {
    setContactDraft({ ...contactInfo });
    setContactEditing(false);
  };

  // Bakım kaydetme
  const saveMaintenance = () => {
    setVehicleInfo({ ...vehicleDraft });
    setMaintenanceEditing(false);
  };

  const cancelMaintenanceEdit = () => {
    setVehicleDraft({ ...vehicleInfo });
    setMaintenanceEditing(false);
  };

  // Mesaj gönderme (cevaplama)
  const sendMessage = () => {
    if (newMessage.trim() === '') return;
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const dateStr = now.toLocaleDateString('tr-TR');

    const newMsg = {
      id: Date.now(),
      sender: 'Ben',
      text: newMessage,
      time: timeStr,
      date: dateStr,
      fromMe: true,
      replyTo: replyingTo ? replyingTo.id : null,
      replyToText: replyingTo ? replyingTo.text : null,
      replyToSender: replyingTo ? replyingTo.sender : null
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    localStorage.setItem('driverMessages', JSON.stringify(updatedMessages));
    setNewMessage('');
    setReplyingTo(null);
  };

  const handleMessageKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReply = (msg) => {
    setReplyingTo(msg);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
    return dateStr;
  };

  // QR'dan gelen yeni mesaj sayısı
  const unreadQRMessages = messages.filter(m => !m.fromMe && !readMessages.includes(m.id)).length;

  const handleMarkMessagesRead = () => {
    if (unreadQRMessages > 0) {
      const allMessageIds = messages.filter(m => !m.fromMe).map(m => m.id);
      const newReadIds = [...new Set([...readMessages, ...allMessageIds])];
      setReadMessages(newReadIds);
      localStorage.setItem('readQRMessages', JSON.stringify(newReadIds));
    }
  };

  return (
    <div className="individual-user-panel" style={{ marginLeft: sidebarCollapsed ? '72px' : '240px', transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <Sidebar onToggle={(collapsed) => setSidebarCollapsed(collapsed)} />
      <main className="user-panel-main">
        <div className="user-panel-header">
          <h1>👤 BİREYSEL PANEL</h1>
          <p>Araç Bilgileri, Bakım, İletişim & Mesajlar</p>
        </div>

        <div className="user-panel-content">

        <div className="user-panel-content">

          {/* ═══════ MESAJ KUTUSU (QR Bildirimleri + Cevaplar) ═══════ */}
          <div className="messages-section" onClick={handleMarkMessagesRead}>
            <div className="section-header">
              <MessageSquare size={24} />
              <h2>MESAJ KUTUSU {unreadQRMessages > 0 && <span className="msg-badge">{unreadQRMessages} yeni</span>}</h2>
              <button className="edit-section-btn" onClick={loadUserData}>
                <RefreshCw size={16} />
                Yenile
              </button>
            </div>

            <div className="messages-card">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <MessageSquare size={48} />
                  <p>Henüz mesaj yok</p>
                  <small>QR kodunuz tarandığında gelen bildirimler burada görünecek</small>
                </div>
              ) : (
                <div className="messages-list" id="messages-list">
                  {messages.map(msg => (
                    <div key={msg.id} className={`message-bubble ${msg.fromMe ? 'sent' : 'received'}`}>
                      {!msg.fromMe && (
                        <div className="msg-header-row">
                          {msg.templateEmoji && <span className="msg-template-emoji">{msg.templateEmoji}</span>}
                          <span className="msg-sender">{msg.sender}</span>
                          {msg.templateTitle && <span className="msg-template-tag">{msg.templateTitle}</span>}
                        </div>
                      )}
                      {msg.replyToText && (
                        <div className="reply-quote">
                          <span className="reply-sender">↩ {msg.replyToSender}</span>
                          <p>{msg.replyToText.length > 60 ? msg.replyToText.substring(0, 60) + '...' : msg.replyToText}</p>
                        </div>
                      )}
                      <p className="msg-text">{msg.text}</p>
                      <div className="msg-footer">
                        <span className="msg-time">{msg.time} • {msg.date}</span>
                        {!msg.fromMe && (
                          <button className="reply-btn" onClick={(e) => { e.stopPropagation(); handleReply(msg); }}>
                            ↩ Cevapla
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Cevaplama Alanı */}
              <div className="message-input-area" onClick={(e) => e.stopPropagation()}>
                {replyingTo && (
                  <div className="replying-bar">
                    <div className="replying-info">
                      <span>↩ Cevaplıyorsun: <strong>{replyingTo.sender}</strong></span>
                      <p>{replyingTo.text.length > 50 ? replyingTo.text.substring(0, 50) + '...' : replyingTo.text}</p>
                    </div>
                    <button className="cancel-reply-btn" onClick={cancelReply}>
                      <X size={16} />
                    </button>
                  </div>
                )}
                <div className="input-row">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleMessageKeyDown}
                    placeholder={replyingTo ? "Cevabınızı yazın..." : "Mesajınızı yazın..."}
                    rows={1}
                  />
                  <button className="send-btn" onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════ ARAÇ BİLGİLERİ & BAKIM ═══════ */}
          <div className="vehicle-info-section">
            <div className="section-header">
              <Wrench size={24} />
              <h2>ARAÇ BİLGİLERİ & BAKIM</h2>
              {!maintenanceEditing ? (
                <button className="edit-section-btn" onClick={() => { setVehicleDraft({ ...vehicleInfo }); setMaintenanceEditing(true); }}>
                  <Edit3 size={16} />
                  Düzenle
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="save-btn" onClick={saveMaintenance}>
                    <Save size={16} /> Kaydet
                  </button>
                  <button className="cancel-btn" onClick={cancelMaintenanceEdit}>
                    <X size={16} /> İptal
                  </button>
                </div>
              )}
            </div>

            <div className="vehicle-card">
              <div className="vehicle-header">
                <div>
                  <h3>{vehicleInfo.brand} {vehicleInfo.model}</h3>
                  <p className="license-plate">{vehicleInfo.plate}</p>
                </div>
                <button
                  className="qr-btn"
                  onClick={() => navigate('/qr-scanner')}
                >
                  <QrCode size={20} />
                  QR KOD GÖSTER
                </button>
              </div>

              {!maintenanceEditing ? (
                <>
                  <div className="vehicle-details">
                    <div className="detail-item">
                      <span className="label">Model Yılı</span>
                      <span className="value">{vehicleInfo.year}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">VIN</span>
                      <span className="value">{vehicleInfo.vin}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Kilometre</span>
                      <span className="value">{vehicleInfo.km} km</span>
                    </div>
                  </div>

                  <div className="maintenance-grid">
                    <h4 className="maintenance-title">
                      <Calendar size={18} />
                      Bakım Takvimi
                    </h4>
                    <div className="maintenance-items">
                      <div className="maintenance-item">
                        <span className="maint-label">Son Servis</span>
                        <span className="maint-value">{formatDate(vehicleInfo.lastService)}</span>
                      </div>
                      <div className="maintenance-item">
                        <span className="maint-label">Sonraki Servis</span>
                        <span className="maint-value highlight">{formatDate(vehicleInfo.nextService)}</span>
                      </div>
                      <div className="maintenance-item">
                        <span className="maint-label">Yağ Değişimi</span>
                        <span className="maint-value">{formatDate(vehicleInfo.oilChange)}</span>
                      </div>
                      <div className="maintenance-item">
                        <span className="maint-label">Lastik Kontrolü</span>
                        <span className="maint-value">{formatDate(vehicleInfo.tireCheck)}</span>
                      </div>
                      <div className="maintenance-item">
                        <span className="maint-label">Fren Kontrolü</span>
                        <span className="maint-value">{formatDate(vehicleInfo.brakeCheck)}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="edit-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Kilometre</label>
                      <input type="text" value={vehicleDraft.km} onChange={(e) => setVehicleDraft({ ...vehicleDraft, km: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Son Servis</label>
                      <input type="date" value={vehicleDraft.lastService} onChange={(e) => setVehicleDraft({ ...vehicleDraft, lastService: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Sonraki Servis</label>
                      <input type="date" value={vehicleDraft.nextService} onChange={(e) => setVehicleDraft({ ...vehicleDraft, nextService: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Yağ Değişimi</label>
                      <input type="date" value={vehicleDraft.oilChange} onChange={(e) => setVehicleDraft({ ...vehicleDraft, oilChange: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Lastik Kontrolü</label>
                      <input type="date" value={vehicleDraft.tireCheck} onChange={(e) => setVehicleDraft({ ...vehicleDraft, tireCheck: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Fren Kontrolü</label>
                      <input type="date" value={vehicleDraft.brakeCheck} onChange={(e) => setVehicleDraft({ ...vehicleDraft, brakeCheck: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══════ BİLDİRİMLER ═══════ */}
          <div className="notifications-section">
            <div className="section-header">
              <AlertCircle size={24} />
              <h2>BİLDİRİMLER ({userNotifications.filter(n => !n.read).length})</h2>
            </div>

            <div className="notifications-list">
              {userNotifications.map(notif => (
                <div
                  key={notif.id}
                  className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="notif-left">
                    <div className={`notif-badge ${notif.type.toLowerCase().replace(/\s/g, '-')}`}>
                      {notif.type.charAt(0)}
                    </div>
                    <div className="notif-content">
                      <h4>{notif.type}</h4>
                      <p>{notif.message}</p>
                      <small>{notif.date}</small>
                    </div>
                  </div>
                  <div className={`notif-status ${notif.read ? 'read-icon' : 'unread-icon'}`}>
                    {notif.read ? '✓' : '●'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════ İLETİŞİM BİLGİLERİ (DÜZENLENEBİLİR) ═══════ */}
          <div className="contact-section">
            <div className="section-header">
              <User size={24} />
              <h2>İLETİŞİM BİLGİLERİ</h2>
              {!contactEditing ? (
                <button className="edit-section-btn" onClick={() => { setContactDraft({ ...contactInfo }); setContactEditing(true); }}>
                  <Edit3 size={16} />
                  Düzenle
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="save-btn" onClick={saveContact}>
                    <Save size={16} /> Kaydet
                  </button>
                  <button className="cancel-btn" onClick={cancelContactEdit}>
                    <X size={16} /> İptal
                  </button>
                </div>
              )}
            </div>

            <div className="contact-card">
              {!contactEditing ? (
                <>
                  <div className="contact-item">
                    <Phone size={20} />
                    <div>
                      <span className="label">Telefon</span>
                      <span className="value">{contactInfo.phone}</span>
                    </div>
                  </div>

                  <div className="contact-item">
                    <Mail size={20} />
                    <div>
                      <span className="label">E-Posta</span>
                      <span className="value">{contactInfo.email}</span>
                    </div>
                  </div>

                  <div className="contact-item">
                    <MapPin size={20} />
                    <div>
                      <span className="label">Adres</span>
                      <span className="value">{contactInfo.address}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="edit-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label><Phone size={14} /> Telefon</label>
                      <input type="tel" value={contactDraft.phone} onChange={(e) => setContactDraft({ ...contactDraft, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label><Mail size={14} /> E-Posta</label>
                      <input type="email" value={contactDraft.email} onChange={(e) => setContactDraft({ ...contactDraft, email: e.target.value })} />
                    </div>
                    <div className="form-group full-width">
                      <label><MapPin size={14} /> Adres</label>
                      <input type="text" value={contactDraft.address} onChange={(e) => setContactDraft({ ...contactDraft, address: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>


        </div>
      </main>
    </div>
  );
}

export default IndividualUserPanel;
