# ============================================
# Driver Ops - Backend Dockerfile
# Node.js + Express API
# ============================================

FROM node:18-alpine

# Çalışma dizini
WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle (production)
RUN npm ci --only=production

# Kaynak kodları kopyala
COPY . .

# Port
EXPOSE 5000

# Sağlık kontrolü
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/dashboard || exit 1

# Uygulamayı başlat
CMD ["node", "server.js"]
