# Отладка уведомлений (realtime)

## Чек-лист

1. **Redis** — должен быть запущен на `localhost:6379`

   ```bash
   docker run -d -p 6379:6379 redis:8-alpine
   # или: redis-server
   ```

2. **Backend (Go)** — должен иметь `REDIS_URL` в `.env`
   - При старте: если Redis недоступен, в логах будет `[realtime] Redis connect failed`
   - Проверка: обновите сделку или привычку — событие должно уйти в Redis

3. **Nest-satellite** — должен подключаться к тому же Redis

   ```bash
   REDIS_URL=redis://localhost:6379 JWT_SECRET_KEY=... npm run start:dev
   ```

4. **Frontend** — Vite proxy переводит `/socket.io` на nest-satellite (3001)
   - В консоли браузера при подключении: `[realtime] Connected, joined workspace: <id>`
   - При получении события: `[realtime] Event: deal.updated` (или habit.\*)

## Если уведомления не приходят

- Откройте DevTools → Console. Есть ли `[realtime] Connected`?
- Есть ли `[realtime] Event: ...` при обновлении сделки/привычки?
- Если нет `Connected` — проверьте куки (access_token), CORS, proxy
- Если нет `Event` — проверьте Redis, backend REDIS_URL, nest-satellite
