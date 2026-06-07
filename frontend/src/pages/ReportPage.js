import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Send, CheckCircle, Car, Lightbulb, Wind, AlertTriangle, Lock, Volume2, Droplets, ParkingCircle, MessageSquare, Gauge, AlertOctagon } from 'lucide-react';
import '../styles/ReportPage.css';

const MESSAGE_TEMPLATES = [
  {
    id: 1,
    icon: <Lightbulb size={28} />,
    title: 'Farlarınız Açık Kalmış',
    message: 'Merhaba, aracınızın farları açık kalmış. Akünüzün bitmemesi için kontrol etmenizi öneririm.',
    category: 'warning',
    emoji: '💡'
  },
  {
    id: 2,
    icon: <Wind size={28} />,
    title: 'Camlarınız Açık',
    message: 'Merhaba, aracınızın camları açık kalmış. Güvenlik için kapatmanızı öneririm.',
    category: 'warning',
    emoji: '🪟'
  },
  {
    id: 3,
    icon: <Lock size={28} />,
    title: 'Kapılar Kilitlenmemiş',
    message: 'Merhaba, aracınızın kapıları kilitli görünmüyor. Kontrol etmenizi öneririm.',
    category: 'danger',
    emoji: '🔓'
  },
  {
    id: 4,
    icon: <ParkingCircle size={28} />,
    title: 'Yanlış Park Etmişsiniz',
    message: 'Merhaba, aracınızı yanlış yere park etmişsiniz. Lütfen aracınızı uygun bir yere alınız.',
    category: 'info',
    emoji: '🅿️'
  },
  {
    id: 5,
    icon: <Volume2 size={28} />,
    title: 'Alarm Çalıyor',
    message: 'Merhaba, aracınızın alarmı çalıyor. Lütfen kontrol ediniz.',
    category: 'danger',
    emoji: '🔊'
  },
  {
    id: 6,
    icon: <Droplets size={28} />,
    title: 'Sızıntı Var',
    message: 'Merhaba, aracınızın altında bir sızıntı fark ettim. Kontrol etmenizi öneririm.',
    category: 'danger',
    emoji: '💧'
  },
  {
    id: 7,
    icon: <AlertTriangle size={28} />,
    title: 'Lastik Problemi',
    message: 'Merhaba, aracınızın lastiğinde bir sorun var gibi görünüyor. Kontrol etmenizi öneririm.',
    category: 'warning',
    emoji: '🛞'
  },
  {
    id: 8,
    icon: <AlertOctagon size={28} />,
    title: 'Hatalı Sollama',
    message: 'Aracınızla tehlikeli ve hatalı sollama yaptığınız tespit edilmiştir. Lütfen trafik kurallarına uyunuz.',
    category: 'danger',
    emoji: '⚠️'
  },
  {
    id: 9,
    icon: <AlertTriangle size={28} />,
    title: 'Kırmızı Işık İhlali',
    message: 'Aracınızın kırmızı ışık ihlali yaptığı tespit edilmiştir. Lütfen trafik kurallarına uyunuz.',
    category: 'danger',
    emoji: '🚦'
  },
  {
    id: 10,
    icon: <Gauge size={28} />,
    title: 'Aşırı Hız',
    message: 'Aracınızla hız sınırlarını aştığınız tespit edilmiştir. Lütfen hız kurallarına uyunuz.',
    category: 'danger',
    emoji: '🏎️'
  },
  {
    id: 11,
    icon: <Car size={28} />,
    title: 'Genel Bildirim',
    message: '',
    category: 'info',
    emoji: '🚗',
    isCustom: true
  }
];

function ReportPage() {
  const { driverId } = useParams();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [senderName, setSenderName] = useState('');

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    if (!template.isCustom) {
      setCustomMessage(template.message);
    } else {
      setCustomMessage('');
    }
    setSent(false);
  };

  const handleSend = async () => {
    if (!customMessage.trim()) return;

    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const dateStr = now.toLocaleDateString('tr-TR');
    const fullDate = `${dateStr} ${timeStr}`;

    try {
      await axios.post('http://localhost:5000/api/vehicles/message', {
        driverId: driverId,
        text: customMessage,
        date: fullDate
      });
      setSent(true);
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
      alert('Mesaj gönderilirken bir hata oluştu: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleBack = () => {
    setSelectedTemplate(null);
    setCustomMessage('');
    setSent(false);
  };

  if (sent) {
    return (
      <div className="report-page">
        <div className="report-container">
          <div className="success-screen">
            <div className="success-icon-wrapper">
              <CheckCircle size={80} />
            </div>
            <h1>Mesajınız İletildi! ✅</h1>
            <p>Araç sahibine bildiriminiz başarıyla gönderildi.</p>
            <div className="sent-summary">
              <span className="sent-emoji">{selectedTemplate?.emoji}</span>
              <div>
                <strong>{selectedTemplate?.title}</strong>
                <p>{customMessage}</p>
              </div>
            </div>
            <button className="back-btn" onClick={handleBack}>
              Başka Bildirim Gönder
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page">
      <div className="report-container">
        {/* Header */}
        <div className="report-header">
          <div className="report-logo">
            <Car size={36} />
          </div>
          <h1>Araç Bildirimi</h1>
          <p>Araç sahibine anonim bildirim gönderin</p>
          <div className="driver-badge">
            <span>Araç: {driverId}</span>
          </div>
        </div>

        {!selectedTemplate ? (
          <>
            {/* Şablon Listesi */}
            <div className="templates-section">
              <h2>
                <MessageSquare size={20} />
                Ne bildirmek istiyorsunuz?
              </h2>
              <div className="templates-grid">
                {MESSAGE_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    className={`template-card ${template.category}`}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="template-icon">
                      {template.emoji}
                    </div>
                    <span className="template-title">{template.title}</span>
                    {template.isCustom && <span className="custom-badge">Serbest Mesaj</span>}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Mesaj Düzenleme */}
            <div className="compose-section">
              <button className="back-link" onClick={handleBack}>
                ← Şablonlara Dön
              </button>

              <div className="compose-header">
                <span className="compose-emoji">{selectedTemplate.emoji}</span>
                <h2>{selectedTemplate.title}</h2>
              </div>

              <div className="compose-form">
                <div className="form-field">
                  <label>Adınız (İsteğe bağlı)</label>
                  <input
                    type="text"
                    placeholder="Anonim olarak gönderilebilir"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Mesajınız</label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    rows={4}
                  />
                </div>

                <button
                  className="send-report-btn"
                  onClick={handleSend}
                  disabled={!customMessage.trim()}
                >
                  <Send size={20} />
                  BİLDİRİM GÖNDER
                </button>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="report-footer">
          <p>🔒 Bildirimler anonim olarak gönderilir</p>
          <p>Driver Ops - Sürücü Bildirimi Sistemi</p>
        </div>
      </div>
    </div>
  );
}

export default ReportPage;
