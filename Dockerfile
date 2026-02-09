# ТОЛЬКО сборка, без nginx
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx vite build

# Создаем минимальный образ только с собранными файлами
FROM alpine:latest

WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist ./
