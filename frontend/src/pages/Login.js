import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, Mail, Lock, AlertCircle, UserPlus, User, ArrowLeft, ArrowRight, KeyRound, Search, MessageSquare } from 'lucide-react';
import '../styles/Login.css';

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState('individual');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchPlate, setSearchPlate] = useState('');

  const handleSearchPlate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.get(`https://driver-ops.onrender.com/api/vehicles/search?plate=${encodeURIComponent(searchPlate)}`);
      navigate(`/report/${res.data.driverId}`);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Bu plaka sistemde kayıtlı değildir!');
      } else {
        setError(err.response?.data?.error || 'Araç bulunamadı!');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setError('');
    setSuccess('');
    setSearchPlate('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formattedEmail = email.trim().toLowerCase();
      const res = await axios.post('https://driver-ops.onrender.com/api/auth/login', { email: formattedEmail, password, userType });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userType', user.userType);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('onboardingCompleted', user.onboardingCompleted);

      if (!user.onboardingCompleted) {
        navigate('/onboarding');
      } else if (user.userType === 'individual') {
        navigate('/user-panel');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş başarısız!');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır!');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      return;
    }

    setLoading(true);

    try {
      const formattedEmail = email.trim().toLowerCase();
      const res = await axios.post('https://driver-ops.onrender.com/api/auth/register', {
        name,
        email: formattedEmail,
        password,
        userType
      });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userType', user.userType);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('onboardingCompleted', user.onboardingCompleted);

      if (!user.onboardingCompleted) {
        navigate('/onboarding');
      } else if (user.userType === 'individual') {
        navigate('/user-panel');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Kayıt başarısız!');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır!');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('https://driver-ops.onrender.com/api/auth/forgot-password', {
        email,
        newPassword: password
      });
      setSuccess(res.data.message);
      setTimeout(() => {
        setMode('login');
        resetForm();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Şifre sıfırlama başarısız!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-large">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <circle cx="12" cy="11" r="3"></circle>
              </svg>
            </div>
            <h1>SÜRÜCÜ OPS</h1>
            <p>
              {mode === 'login' && 'Sistem Girişi'}
              {mode === 'register' && 'Yeni Hesap Oluştur'}
              {mode === 'forgot' && 'Şifre Sıfırlama'}
              {mode === 'search' && 'Hızlı Araç Bildirimi'}
            </p>
          </div>

          {/* ===== LOGIN FORM ===== */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="login-form">
              <div className="user-type-selector">
                <label className={`type-option ${userType === 'individual' ? 'active' : ''}`}>
                  <input type="radio" value="individual" checked={userType === 'individual'} onChange={(e) => setUserType(e.target.value)} />
                  <span>👤 Bireysel</span>
                </label>
                <label className={`type-option ${userType === 'corporate' ? 'active' : ''}`}>
                  <input type="radio" value="corporate" checked={userType === 'corporate'} onChange={(e) => setUserType(e.target.value)} />
                  <span>🏢 Şirket</span>
                </label>
              </div>

              <div className="form-group">
                <label><Mail size={18} /> E-Posta</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" disabled={loading} required />
              </div>

              <div className="form-group">
                <label><Lock size={18} /> Şifre</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifrenizi girin" disabled={loading} required />
              </div>

              {error && (<div className="error-message"><AlertCircle size={16} />{error}</div>)}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (<><span className="spinner"></span>Giriş Yapılıyor...</>) : (<><LogIn size={18} />Giriş Yap</>)}
              </button>

              <div className="login-footer">
                <button type="button" className="link-btn" onClick={() => { setMode('forgot'); resetForm(); }}>Şifremi Unuttum</button>
                <span className="divider">•</span>
                <button type="button" className="link-btn" onClick={() => { setMode('register'); resetForm(); }}>Kayıt Ol</button>
              </div>
            </form>
          )}

          {/* ===== REGISTER FORM ===== */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="login-form">
              <div className="user-type-selector">
                <label className={`type-option ${userType === 'individual' ? 'active' : ''}`}>
                  <input type="radio" value="individual" checked={userType === 'individual'} onChange={(e) => setUserType(e.target.value)} />
                  <span>👤 Bireysel</span>
                </label>
                <label className={`type-option ${userType === 'corporate' ? 'active' : ''}`}>
                  <input type="radio" value="corporate" checked={userType === 'corporate'} onChange={(e) => setUserType(e.target.value)} />
                  <span>🏢 Şirket</span>
                </label>
              </div>

              <div className="form-group">
                <label><User size={18} /> Ad Soyad</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınız Soyadınız" disabled={loading} required />
              </div>

              <div className="form-group">
                <label><Mail size={18} /> E-Posta</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" disabled={loading} required />
              </div>

              <div className="form-group">
                <label><Lock size={18} /> Şifre</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="En az 6 karakter" disabled={loading} required />
              </div>

              <div className="form-group">
                <label><Lock size={18} /> Şifre Tekrar</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Şifrenizi tekrar girin" disabled={loading} required />
              </div>

              {error && (<div className="error-message"><AlertCircle size={16} />{error}</div>)}

              <button type="submit" className="login-btn register-btn" disabled={loading}>
                {loading ? (<><span className="spinner"></span>Kayıt Yapılıyor...</>) : (<><UserPlus size={18} />Kayıt Ol</>)}
              </button>

              <div className="login-footer">
                <button type="button" className="link-btn" onClick={() => { setMode('login'); resetForm(); }}>
                  <ArrowLeft size={14} /> Giriş Sayfasına Dön
                </button>
              </div>
            </form>
          )}

          {/* ===== FORGOT PASSWORD FORM ===== */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="login-form">
              <div className="form-group">
                <label><Mail size={18} /> Kayıtlı E-Posta</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" disabled={loading} required />
              </div>

              <div className="form-group">
                <label><Lock size={18} /> Yeni Şifre</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="En az 6 karakter" disabled={loading} required />
              </div>

              <div className="form-group">
                <label><Lock size={18} /> Yeni Şifre Tekrar</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Yeni şifrenizi tekrar girin" disabled={loading} required />
              </div>

              {error && (<div className="error-message"><AlertCircle size={16} />{error}</div>)}
              {success && (<div className="success-message"><KeyRound size={16} />{success}</div>)}

              <button type="submit" className="login-btn forgot-btn" disabled={loading}>
                {loading ? (<><span className="spinner"></span>Güncelleniyor...</>) : (<><KeyRound size={18} />Şifreyi Güncelle</>)}
              </button>

              <div className="login-footer">
                <button type="button" className="link-btn" onClick={() => { setMode('login'); resetForm(); }}>
                  <ArrowLeft size={14} /> Giriş Sayfasına Dön
                </button>
              </div>
            </form>
          )}
          {/* ===== SEARCH FORM ===== */}
          {mode === 'search' && (
            <form onSubmit={handleSearchPlate} className="login-form">
              <div className="form-group">
                <label><Search size={18} /> Araç Plakası</label>
                <input 
                  type="text" 
                  value={searchPlate} 
                  onChange={(e) => setSearchPlate(e.target.value)} 
                  placeholder="Örn: 34 ABC 123" 
                  disabled={loading} 
                  required 
                  autoFocus
                />
              </div>

              {error && (<div className="error-message"><AlertCircle size={16} />{error}</div>)}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (<><span className="spinner"></span>Aranıyor...</>) : (<><MessageSquare size={18} />Ara ve Bildirim Gönder</>)}
              </button>

              <button type="button" className="login-btn forgot-btn" onClick={() => { setMode('login'); resetForm(); }} disabled={loading} style={{marginTop: '10px'}}>
                <ArrowLeft size={18} />
                Giriş Ekranına Dön
              </button>
            </form>
          )}

        </div>

        {/* Sağ Taraf - Bilgiler */}
        <div className="login-info">
          <div className="quick-search-card" onClick={() => { setMode('search'); resetForm(); }}>
            <div className="quick-search-icon">
              <MessageSquare size={32} color="#0f111a" />
            </div>
            <div className="quick-search-text">
              <h3 style={{ color: '#00d4ff', margin: 0, fontSize: '1.2rem' }}>HIZLI ARAÇ BİLDİRİMİ</h3>
              <p style={{ margin: '5px 0 0 0', color: '#b0b0c0' }}>Plaka ile arama yapıp sürücüye anında mesaj gönderin</p>
            </div>
            <div className="quick-search-arrow">
              <ArrowRight size={24} color="#00d4ff" />
            </div>
          </div>

          <a href="/driver-ops.apk" download className="quick-search-card" style={{ marginTop: '15px', textDecoration: 'none', background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)', borderColor: 'rgba(76, 175, 80, 0.3)' }}>
            <div className="quick-search-icon" style={{ background: 'rgba(76, 175, 80, 0.2)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
            </div>
            <div className="quick-search-text">
              <h3 style={{ color: '#4caf50', margin: 0, fontSize: '1.2rem' }}>📱 ANDROİD UYGULAMASI</h3>
              <p style={{ margin: '5px 0 0 0', color: '#b0b0c0' }}>Mobil uygulamamızı indirip her an telefonunuzdan yönetin</p>
            </div>
            <div className="quick-search-arrow">
              <ArrowRight size={24} color="#4caf50" />
            </div>
          </a>

          <div className="info-card">
            <h3>👤 Bireysel Panel</h3>
            <p>Araç bilgilerini görüntüleyin, QR kod oluşturun, bildirimleri takip edin</p>
          </div>
          <div className="info-card">
            <h3>🏢 Şirket Paneli</h3>
            <p>Tüm araçlarını ve sürücülerini yönetin, analitiğe erişin</p>
          </div>
          <div className="info-card">
            <h3>📡 Anonim Bildiriler</h3>
            <p>QR kod tarayarak diğer sürücüler hakkında güvenli feedback verin</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
