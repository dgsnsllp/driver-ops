# ============================================
# Driver Ops - Frontend Dockerfile
# React App (Multi-stage build)
# ============================================

# --- Stage 1: Build ---
FROM node:18-alpine AS build

WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci

# Kaynak kodları kopyala
COPY . .

# Build argümanı ile API URL ayarla
ARG REACT_APP_API_URL=http://localhost:5000
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Production build oluştur
RUN npm run build

# --- Stage 2: Serve ---
FROM nginx:alpine

# Özel nginx yapılandırmasını kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build dosyalarını nginx'e kopyala
COPY --from=build /app/build /usr/share/nginx/html

# Port
EXPOSE 80

# Sağlık kontrolü
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
