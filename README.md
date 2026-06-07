# Driver Ops - Sürücü Bildirimi Sistemi

## 📱 Genel Bakış

Driver Ops, araç sahipleri ile dış dünya arasındaki iletişimi dijitalleştiren ve şirketler için veri odaklı filo yönetimi sağlayan yenilikçi bir platformdur.

### 🎯 Temel Özellikler

#### 1. Bireysel Kullanıcı Modülü (Güvenli İletişim)
- **Dinamik QR Kodlar**: Araç camlarına yerleştirilen QR kodlar sayesinde araç sahiplerinin telefon numarasını paylaşmadan üçüncü kişilerle iletişim
- **Anonimlik**: Üçüncü şahıslar QR kodu taratarak araç sahibine doğrudan mesaj gönderebilir, ancak kişisel verilere erişemez
- **Hızlı Çözüm**: Yanlış park, acil durum veya servis ihtiyacı gibi durumlarda saniyeler içinde araç sahibine ulaşılması

#### 2. Kurumsal Filo Modülü (Akıllı Takip ve Analiz)
- **Şoför Performans Takibi**: Araçlara gelen geri bildirimler üzerinden şoförlerin trafik kurallarına uyumu analiz edilir
- **Veri Odaklı Karar Alma**: Toplanan tüm bildirim ve servis verileri işlenerek şirket yöneticilerine anlamlı raporlar sunulur
- **Dijital Kimlik**: Her araç, servis kayıtlarından şoför geçmişine kadar tüm detayların dijital olarak tutulduğu benzersiz bir kimliğe sahip olur

## 🛠️ Teknoloji Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Veritabanı**: MongoDB (yapılandırılabilir)
- **Gerçek Zamanlı İletişim**: Socket.io
- **QR Kod**: qrcode kütüphanesi

### Frontend
- **Framework**: React 18
- **Yönlendirme**: React Router v6
- **Veri Görselleştirme**: Recharts
- **HTTP İstemcisi**: Axios
- **Gerçek Zamanlı**: Socket.io Client
- **İkonlar**: Lucide React

### Araçlar
- **Paket Yöneticisi**: npm
- **Geliştirme**: Nodemon

## 📂 Proje Yapısı

```
driver-ops/
├── backend/                 # Node.js/Express API
│   ├── config/             # Konfigürasyon dosyaları
│   ├── controllers/        # İş mantığı
│   ├── middleware/         # Express middleware
│   ├── models/             # Veri modelleri
│   ├── routes/             # API rotaları
│   ├── server.js           # Ana sunucu dosyası
│   ├── package.json
│   └── .env
├── frontend/               # React Dashboard
│   ├── public/
│   ├── src/
│   │   ├── api/           # API çağrıları
│   │   ├── components/    # React bileşenleri
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Sayfalar
│   │   ├── styles/        # CSS dosyaları
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
├── package.json
└── README.md
```

## 🚀 Kurulum ve Başlama

### Gereksinimler
- Node.js (v14 veya üzeri)
- npm (v6 veya üzeri)

### 1. Repoyu Klonlayın
```bash
git clone https://github.com/yourusername/driver-ops.git
cd driver-ops
```

### 2. Tüm Bağımlılıkları Yükleyin
```bash
npm run install-all
```

Bu komut otomatik olarak:
- Root node_modules'ı yükler
- Backend bağımlılıklarını yükler
- Frontend bağımlılıklarını yükler

### 3. Backend'i Başlatın (Terminal 1)
```bash
npm run backend
```

Sunucu `http://localhost:5000` adresinde çalışacaktır.

### 4. Frontend'i Başlatın (Terminal 2)
```bash
npm run frontend
```

Uygulama `http://localhost:3000` adresinde açılacaktır.

### 5. Her İkisini Birlikte Başlatın (Alternatif)
```bash
npm run dev
```

## 📡 API Endpoints

### Dashboard
- `GET /api/dashboard` - Dashboard istatistikleri

### Sürücüler
- `GET /api/drivers` - Tüm sürücüleri listele
- `GET /api/drivers/:id` - Spesifik sürücü bilgisi

### Bildirimler
- `GET /api/notifications` - Tüm bildirimleri listele
- `GET /api/notification-trend` - 30 günlük bildirim trendi

### QR Kodlar
- `GET /api/qr/:driverId` - Sürücü için QR kod oluştur

### Gerçek Zamanlı (Socket.io)
- `notify` - Bildirim gönder
- `notification` - Bildirim al

## 🎨 Dashboard Bileşenleri

1. **Overview**: Genel istatistikler ve sistem durumu
2. **Drivers**: Aktif sürücülerin listesi
3. **Notifications**: Gelen bildirimler
4. **Intelligence**: İleri analizler ve raporlar

## 🔐 Güvenlik Özelikleri

- Şoför telefon numaraları gizli tutulur
- QR kod tabanlı anonim iletişim
- Token tabanlı kimlik doğrulaması
- CORS koruması

## 📊 Veri Analitikleri

Sistem aşağıdaki metrikleri takip eder:
- Bildirim trendleri (30 günlük)
- Şoför performans skorları
- Servis geçmişi
- Trafik kuralına uyum oranları
- Araç kullanım alışkanlıkları

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'e push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT Lisansı altında açık kaynak olarak sunulmaktadır.

## 📧 İletişim

Sorularınız veya önerileriniz için lütfen bir issue açın veya bize email gönderin.

---

**Son Güncelleme**: 5 Haziran 2026
