#base image
FROM node:22.14.0-alpine

WORKDIR /app

#  Copy cả file package-log.json để cài đặc chính xác phiên bản 
#  của các dependency trong package-log.json, kể cả dependency con 
COPY package*.json ./

RUN npm ci

# 5. Copy toàn bộ code vào container
COPY . .

# 6. Build TypeScript sang JavaScript
RUN npm run build

# 7. Port của ứng dụng 
EXPOSE 8080

# 8. Chạy cái đã build
CMD [ "npm", "start" ]