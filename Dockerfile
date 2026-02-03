# Этап 1: Сборка Vue-приложения
FROM node:22-alpine AS build

WORKDIR /app

# Копируем package.json для кэширования зависимостей
COPY package*.json ./
RUN npm ci

# Копируем остальные файлы
COPY . .

# Собираем Vue приложение
RUN npm run build

# Этап 2: Nginx для сервировки статики
FROM nginx:stable-alpine

# Копируем собранное Vue приложение
# Vite создает папку dist
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]