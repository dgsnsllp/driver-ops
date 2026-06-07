import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Phone, Building2, Car, Calendar, Wrench, AlertCircle } from 'lucide-react';
import '../styles/Onboarding.css';

function Onboarding() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('userType');
  const userName = localStorage.getItem('userName');

  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (userType === 'individual') {
      if (!phone || !plate || !model || !year) {
        setError('Lütfen tüm zorunlu araç ve iletişim alanlarını doldurun.');
        return;
      }
    } else if (userType === 'corporate') {
      if (!phone || !companyName) {
        setError('Lütfen tüm firma ve iletişim alanlarını doldurun.');
        return;
      }
    }

    setLoading(true);

    try {
      const res = await axios.post('https://driver-ops.onrender.com/api/auth/onboarding', {
        userId,
        phone,
        companyName,
        plate,
        model,
        year,
        maintenanceDate
      });

      localStorage.setItem('onboardingCompleted', 'true');
      
      // Redirect based on user type
      if (userType === 'individual') {
        navigate('/user-panel');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Profil tamamlanırken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <div className="welcome-icon">👋</div>
          <h1>Hoş Geldin, {userName}!</h1>
          <p>Sistemi kullanmaya başlamadan önce profilini tamamlaman gerekiyor.</p>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* İletişim Bilgileri - Ortak */}
          <div className="form-section">
            <h3>İletişim Bilgileri</h3>
            <div className="form-group">
              <label><Phone size={16} /> Telefon Numarası *</label>
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="05XX XXX XX XX"
                required
              />
            </div>
          </div>

          {/* Şirket İse Firma Adı */}
          {userType === 'corporate' && (
            <div className="form-section">
              <h3>Firma Bilgileri</h3>
              <div className="form-group">
                <label><Building2 size={16} /> Firma Adı *</label>
                <input 
                  type="text" 
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)} 
                  placeholder="Örn: X Lojistik A.Ş."
                  required
                />
              </div>
            </div>
          )}

          {/* Bireysel İse Araç Bilgileri */}
          {userType === 'individual' && (
            <div className="form-section">
              <h3>Araç Bilgileri</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label><Car size={16} /> Plaka *</label>
                  <input 
                    type="text" 
                    value={plate} 
                    onChange={(e) => setPlate(e.target.value)} 
                    placeholder="34 ABC 123"
                    required
                  />
                </div>
                <div className="form-group">
                  <label><Car size={16} /> Marka/Model *</label>
                  <input 
                    type="text" 
                    value={model} 
                    onChange={(e) => setModel(e.target.value)} 
                    placeholder="Toyota Corolla"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><Calendar size={16} /> Yıl *</label>
                  <input 
                    type="number" 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)} 
                    placeholder="2023"
                    min="1990"
                    max="2030"
                    required
                  />
                </div>
                <div className="form-group">
                  <label><Wrench size={16} /> Sonraki Bakım Tarihi</label>
                  <input 
                    type="date" 
                    value={maintenanceDate} 
                    onChange={(e) => setMaintenanceDate(e.target.value)} 
                  />
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Kaydediliyor...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Profili Tamamla ve Başla
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Onboarding;
