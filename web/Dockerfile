# Multi-stage Dockerfile for Web App
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY web/package*.json ./web/

RUN npm install

COPY shared ./shared
COPY web ./web

RUN npm run build --workspace=@project-mgmt/shared
RUN npm run build --workspace=@project-mgmt/web

# Nginx Static Server
FROM nginx:alpine AS runner

COPY --from=builder /app/web/dist /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
