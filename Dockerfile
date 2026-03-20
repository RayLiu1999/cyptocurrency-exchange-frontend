# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# 安裝依賴
COPY package.json package-lock.json ./
RUN npm ci

# 複製程式碼
COPY . .

# 接收建置參數並設定為環境變數，讓 Vite 在編譯時能注入
ARG VITE_API_BASE_URL
ARG VITE_WS_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_URL=$VITE_WS_URL

# 編譯
RUN npm run build

# Run Stage
FROM nginx:alpine

# 複製編譯完成的靜態檔案到 Nginx 目錄
COPY --from=builder /app/dist /usr/share/nginx/html

# 複製 Nginx 設定 (可選，若有特殊路由需求)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
