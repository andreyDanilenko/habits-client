# Frontend Application

Vue 3 + TypeScript проект с архитектурой Feature-Sliced Design (FSD).

## Технологии

- **Vue 3** - прогрессивный JavaScript фреймворк
- **TypeScript** - типизированный JavaScript
- **Vite** - быстрый сборщик
- **Vue Router** - маршрутизация
- **Pinia** - управление состоянием
- **ESLint** - линтинг кода

## Установка

```bash
npm install
```

## Разработка

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:3000`

## Сборка

```bash
npm run build
```

## Структура проекта

Проект следует архитектуре **Feature-Sliced Design (FSD)**. Подробнее см. [ARCHITECTURE.md](./ARCHITECTURE.md)

```
src/
├── app/          # Инициализация приложения, роутинг, провайдеры
├── pages/        # Страницы приложения
├── widgets/      # Крупные самостоятельные блоки интерфейса
├── features/     # Бизнес-функциональность
├── entities/     # Бизнес-сущности
└── shared/       # Переиспользуемые модули (UI, утилиты, конфиги)
```

## Алиасы путей

- `@/` - корень src
- `@app/` - инициализация приложения
- `@pages/` - страницы
- `@widgets/` - виджеты
- `@features/` - фичи
- `@entities/` - сущности
- `@shared/` - общие модули
