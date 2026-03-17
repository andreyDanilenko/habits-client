# SSL — Выпуск и обновление сертификатов

Руководство по настройке и автоматическому обновлению SSL для Docker-проекта.

---

## 1. Подготовка (внешняя)

- Убедитесь, что A-запись поддомена (например, `habits.lifedream.tech`) направлена на IP вашего сервера.
- Откройте порты в фаерволе:
  ```bash
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  ```

---

## 2. Выпуск сертификата (через Certbot Standalone)

Нужно временно освободить 80 порт, чтобы Certbot подтвердил права на домен:

```bash
# 1. Останавливаем контейнеры
docker-compose down

# 2. Выпускаем сертификат (тип RSA для лучшей совместимости)
sudo certbot certonly --standalone --key-type rsa \
  -d habits.lifedream.tech \
  --config-dir /root/project/deployment/nginx/ssl/config \
  --work-dir /root/project/deployment/nginx/ssl/work \
  --logs-dir /root/project/deployment/nginx/ssl/logs
```

---

## 3. Перенос файлов в проект

Certbot хранит оригиналы в папке `config`. Чтобы Nginx в Docker их увидел, копируем их «физически» (не ссылками):

```bash
# Копируем содержимое в папку, которая монтируется в Docker
sudo cat /root/project/deployment/nginx/ssl/config/live/habits.lifedream.tech/fullchain.pem > /root/project/deployment/nginx/ssl/habits.lifedream.tech.crt
sudo cat /root/project/deployment/nginx/ssl/config/live/habits.lifedream.tech/privkey.pem > /root/project/deployment/nginx/ssl/habits.lifedream.tech.key

# Даем права на чтение для Nginx
sudo chmod 644 /root/project/deployment/nginx/ssl/habits.lifedream.tech.*
```

---

## 4. Настройка Nginx (`nginx.conf`)

В блоке `server` для порта 443 обязательно добавьте эти строки для корректной работы SPA:

```nginx
ssl_certificate /etc/nginx/ssl/habits.lifedream.tech.crt;
ssl_certificate_key /etc/nginx/ssl/habits.lifedream.tech.key;

location / {
    proxy_pass http://habits_frontend:80;
    proxy_intercept_errors on;
    error_page 404 =200 /index.html; # Лечит 404 при F5
    proxy_set_header X-Forwarded-Proto https; # Лечит "Не защищено" (Mixed Content)
}
```

---

## 5. Автоматическое обновление сертификатов

Сертификат выдается на 90 дней. Certbot автоматически продлевает сертификаты, если до истечения осталось менее 30 дней.

### 5.1. Создание скрипта обновления

Создайте файл скрипта в папке проекта:

```bash
nano /root/project/deployment/renew_certs.sh
```

Вставьте следующий код:

```bash
#!/bin/bash

PROJECT_DIR="/root/project/deployment"
SSL_DIR="$PROJECT_DIR/nginx/ssl"

echo "--- Starting certificate renewal: $(date) ---"

# 1. Останавливаем контейнеры (освобождаем 80 порт)
cd $PROJECT_DIR
docker-compose down

# 2. Продлеваем сертификаты (Certbot сам поймет, какие пора обновить)
certbot renew --standalone --key-type rsa \
  --config-dir $SSL_DIR/config \
  --work-dir $SSL_DIR/work \
  --logs-dir $SSL_DIR/logs

# 3. Обновляем файлы в папке nginx/ssl
DOMAIN="habits.lifedream.tech"
cat $SSL_DIR/config/live/$DOMAIN/fullchain.pem > $SSL_DIR/$DOMAIN.crt
cat $SSL_DIR/config/live/$DOMAIN/privkey.pem > $SSL_DIR/$DOMAIN.key

# 4. Поправляем права доступа
chmod 644 $SSL_DIR/$DOMAIN.*

# 5. Запускаем проект обратно
docker-compose up -d

echo "--- Renewal finished ---"
```

### 5.2. Права на выполнение

```bash
chmod +x /root/project/deployment/renew_certs.sh
```

### 5.3. Настройка Cron

Добавьте в crontab (`sudo crontab -e`):

```bash
0 3 * * 1 /root/project/deployment/renew_certs.sh >> /var/log/cert_renewal.log 2>&1
```

Эта настройка запускает скрипт каждый понедельник в 3:00 ночи.

### 5.4. Проверка работы

Для тестирования запустите скрипт вручную:

```bash
/root/project/deployment/renew_certs.sh
```

---

## 📋 Важные моменты

- **Совместимость**: Используется RSA вместо ECDSA для лучшей совместимости
- **SPA роутинг**: Важно настроить обработку 404 ошибок для корректной работы одностраничных приложений
- **Mixed Content**: `proxy_set_header X-Forwarded-Proto https` решает проблему «Не защищено» в браузере
- **Логирование**: Все операции автообновления логируются в `/var/log/cert_renewal.log`

---

## 🔧 Быстрые команды

```bash
# Ручное обновление
sudo certbot renew

# Проверка срока действия
sudo certbot certificates

# Принудительное обновление (для тестирования)
sudo certbot renew --force-renewal
```

---

## 🛠️ Устранение проблем

- **Порт 80 занят**: Убедитесь, что контейнеры остановлены перед выпуском/обновлением
- **Права доступа**: Проверьте, что Nginx имеет доступ к файлам сертификатов
- **Конфигурация Nginx**: Убедитесь, что пути к сертификатам в `nginx.conf` соответствуют реальным путям
