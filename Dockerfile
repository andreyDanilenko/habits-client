# Этап 1: Сборка Vue-приложения
FROM node:24-alpine AS build 

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx vite build 

# Этап 2: Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
