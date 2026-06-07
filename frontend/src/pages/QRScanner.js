import React, { useState } from 'react';
import { QrCode, Copy, Download, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import '../styles/QRScanner.css';

function QRScanner() {
  const [driverId] = useState('DRV-001');
  const [qrGenerated, setQrGenerated] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const qrValue = `https://driver-ops-peach.vercel.app/report/${driverId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.querySelector('.qr-display-image');
    const link = document.createElement('a');
    link.href = element.src;
    link.download = `QR_${driverId}.png`;
    link.click();
  };

  return (
    <div className="qr-scanner-page" style={{ marginLeft: sidebarCollapsed ? '72px' : '240px', transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <Sidebar onToggle={(collapsed) => setSidebarCollapsed(collapsed)} />
      <main className="qr-main">
        <div className="qr-header">
          <h1>🔲 QR KOD YÖNETİMİ</h1>
          <p>Araçınız için QR kod oluşturun ve paylaşın</p>
        </div>

        <div className="qr-container">
          {/* QR Kod Görüntüleme */}
          <div className="qr-display-section">
            <h2>QR Kodunuz</h2>
            <div className="qr-box">
              {qrGenerated ? (
                <div className="qr-content">
                  <div className="qr-placeholder">
                    <QrCode size={100} strokeWidth={1} />
                    <img 
                      className="qr-display-image"
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrValue)}`}
                      alt="QR Kod"
                    />
                  </div>
                  <p className="qr-hint">Sürücü bildirimi için bu kodu tarayın</p>
                </div>
              ) : (
                <div className="no-qr">
                  <QrCode size={60} />
                  <p>QR kod bulunamadı</p>
                </div>
              )}
            </div>

            <div className="qr-actions">
              <button className="action-btn copy-btn" onClick={handleCopy}>
                <Copy size={18} />
                {copied ? 'Kopyalandı!' : 'KOPYALA'}
              </button>
              <button className="action-btn download-btn" onClick={handleDownload}>
                <Download size={18} />
                İNDİR
              </button>
            </div>

            <div className="qr-info">
              <p><strong>URL:</strong> {qrValue}</p>
            </div>
          </div>


          {/* Bildirim Yazısı */}
          <div className="instructions-section">
            <h2>NASIL KULLANILIR?</h2>
            <div className="instructions-list">
              <div className="instruction-item">
                <span className="number">1</span>
                <p>Yukarıdaki QR kodu indirin veya fotoğrafını çekin</p>
              </div>
              <div className="instruction-item">
                <span className="number">2</span>
                <p>QR kodu araçınızın görünür bir yerine yapıştırın</p>
              </div>
              <div className="instruction-item">
                <span className="number">3</span>
                <p>Diğer sürücüler kodu tarayarak anonim bildir oluştursunlar</p>
              </div>
              <div className="instruction-item">
                <span className="number">4</span>
                <p>Bildirimleri panelden takip edin ve yanıt verin</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default QRScanner;
