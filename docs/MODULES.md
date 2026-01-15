# Описание модулей проекта

Документация по структуре модулей, их назначению и взаимодействию.

## 📋 Текущие модули

### 🔐 Авторизация (Auth Module)

**Расположение:** `features/auth/`

**Компоненты:**

- `model/auth-store.ts` - Pinia store для управления состоянием авторизации
- `types/auth.ts` - Типы для LoginDto, RegisterDto, AuthResponse
- `lib/guards.ts` - Защита маршрутов (route guards)

**Функциональность:**

- ✅ Вход в систему (login)
- ✅ Регистрация (register)
- ✅ Выход (logout)
- ✅ Обновление токенов (refresh)
- ✅ Защита маршрутов
- ✅ Хранение токенов в localStorage

**Зависимости:**

- Использует: `entities/user`, `shared/api/client`

**Связанные страницы:**

- `/login` - страница входа
- `/register` - страница регистрации

---

### 👤 Пользователь (User Module)

**Расположение:** `entities/user/`

**Компоненты:**

- `model/user-store.ts` - Pinia store для данных пользователя
- `types/user.ts` - Типы User, UserWorkspace

**Функциональность:**

- ✅ Получение текущего пользователя
- ✅ Управление профилем пользователя
- ✅ Работа с инициалами пользователя

**Используется в:**

- `features/auth` - для установки пользователя после авторизации
- `widgets/header/ProfileDropdownWidget` - отображение профиля
- `pages/settings` - настройки профиля

---

### 📝 Привычки (Habits Module)

**Расположение:** `entities/habit/`

**Компоненты:**

- `model/habit-store.ts` - Pinia store для управления привычками
- `types/habit.ts` - Типы Habit, HabitCompletion, CreateHabitDto

**Функциональность:**

- ✅ Создание привычек
- ✅ Получение списка привычек
- ✅ Отметка выполнения привычек
- ✅ Получение привычек на сегодня
- ✅ Статистика выполнения

**API endpoints:**

- `GET /habits` - список всех привычек
- `POST /habits` - создание привычки
- `POST /habits/:id/toggle` - переключение выполнения
- `GET /habits/completions` - история выполнений

**Используется в:**

- `widgets/habits/TodayHabitsWidget` - виджет привычек на сегодня
- `pages/habits` - страница управления привычками
- `widgets/stats-overview` - статистика

---

### 🏢 Workspace (Рабочее пространство)

**Расположение:** `entities/workspace/`

**Компоненты:**

- `model/workspace-store.ts` - Pinia store для workspace
- `types/workspace.ts` - Типы Workspace, CreateWorkspaceDto

**Функциональность:**

- ✅ Управление рабочими пространствами
- ✅ Переключение между workspace
- ✅ Создание нового workspace

**Используется в:**

- `widgets/header/WorkspaceSwitcherWidget` - переключение workspace
- Разделение данных по workspace (привычки, проекты и т.д.)

---

### 🧩 Виджеты

#### Header Widget (`widgets/header/`)

- `AppHeader.vue` - главная шапка приложения
- `TodayStatsWidget.vue` - статистика на сегодня
- `WorkspaceSwitcherWidget.vue` - переключение workspace
- `NotificationsWidget.vue` - уведомления
- `ProfileDropdownWidget.vue` - меню профиля

#### Habits Widget (`widgets/habits/`)

- `TodayHabitsWidget.vue` - список привычек на сегодня

#### Calendar Widget (`widgets/calendar/`)

- `CalendarWidget.vue` - календарь привычек

#### Stats Widget (`widgets/stats-overview/`)

- `StatsOverviewWidget.vue` - обзор статистики

#### Journal Widget (`widgets/journal/`)

- `QuickJournalWidget.vue` - быстрая запись в дневник

#### Activity Widget (`widgets/activity/`)

- `RecentActivityWidget.vue` - недавняя активность

---

### 📄 Страницы (Pages)

#### Dashboard (`pages/dashboard/`)

- Главная страница с виджетами
- Приветствие пользователя
- Обзор всех модулей

#### Habits (`pages/habits/`)

- Управление привычками
- Список всех привычек
- Создание и редактирование

#### Login/Register (`pages/login/`, `pages/register/`)

- Авторизация и регистрация

#### Settings (`pages/settings/`)

- Настройки профиля
- Настройки уведомлений
- Управление аккаунтом

---

### 🔧 Shared (Общие модули)

#### UI Components (`shared/ui/`)

- `Button.vue` - кнопка с вариантами стилей
- `Card.vue` - карточка для контента
- `Spinner.vue` - индикатор загрузки

#### API Client (`shared/api/`)

- `client.ts` - основной API клиент (Axios)
- `mock-client.ts` - мок-клиент для разработки
- `endpoints.ts` - константы endpoints

#### Config (`shared/config/`)

- Конфигурация приложения

#### Lib (`shared/lib/`)

- Утилиты и хелперы

---

## 🔗 Схема зависимостей

```
┌─────────────────────────────────────┐
│           app/                      │
│  (роутинг, провайдеры, стили)      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│          pages/                     │
│  (композиция виджетов и фич)       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         widgets/                    │
│  (крупные блоки интерфейса)        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│        features/                    │
│  (бизнес-функциональность)         │
│  - auth                            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│        entities/                    │
│  (бизнес-сущности)                 │
│  - user                            │
│  - habit                           │
│  - workspace                       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         shared/                     │
│  (UI, утилиты, API клиенты)        │
└─────────────────────────────────────┘
```

## 📊 Текущая архитектура модулей

### Модуль = Сущность + Фичи + Виджеты + Страницы

**Пример модуля "Привычки":**

```
Habits Module
├── entities/habit/          # Сущность
│   ├── types/habit.ts       # Типы данных
│   └── model/habit-store.ts # Состояние
├── features/habits/         # Фичи (если будут)
│   └── create-habit/        # Создание привычки
├── widgets/habits/          # Виджеты
│   └── TodayHabitsWidget    # Виджет на сегодня
└── pages/habits/            # Страница
    └── HabitsPage.vue       # Главная страница модуля
```

### Принципы организации модулей

1. **Инкапсуляция** - модуль содержит всё необходимое для своей функциональности
2. **Независимость** - модули слабо связаны между собой
3. **Переиспользование** - shared компоненты используются всеми модулями
4. **Публичный API** - каждый модуль экспортирует только через `index.ts`

---

## 🔄 Взаимодействие модулей

### Текущие связи:

- **Auth ↔ User**: Auth устанавливает пользователя после авторизации
- **Habits ↔ Workspace**: Привычки привязаны к workspace
- **All ↔ Shared**: Все модули используют shared компоненты
- **Pages ↔ Widgets**: Страницы используют виджеты
- **Widgets ↔ Features**: Виджеты используют фичи и сущности

### Правила взаимодействия:

✅ **Разрешено:**

- Модули используют shared
- Features используют entities
- Widgets используют features и entities
- Pages используют widgets, features, entities

❌ **Запрещено:**

- Entities используют features (обратная зависимость)
- Shared использует что-либо бизнес-специфичное
- Модули напрямую зависят от других модулей (только через shared)

---

## 📈 Статистика модулей

| Модуль    | Entities | Features | Widgets | Pages |
| --------- | -------- | -------- | ------- | ----- |
| Auth      | -        | 1        | -       | 2     |
| User      | 1        | -        | 1       | 1     |
| Habits    | 1        | -        | 1       | 1     |
| Workspace | 1        | -        | 1       | -     |
| Shared    | -        | -        | -       | -     |

**Всего:**

- Entities: 3 (user, habit, workspace)
- Features: 1 (auth)
- Widgets: 6
- Pages: 4

---

## 🎯 Назначение каждого слоя

### app/

Глобальная конфигурация, роутинг, провайдеры

### pages/

Точки входа пользователя, композиция виджетов

### widgets/

Переиспользуемые блоки интерфейса, композиция фич

### features/

Конкретные бизнес-действия пользователя

### entities/

Бизнес-сущности, данные, API

### shared/

Переиспользуемые компоненты без бизнес-логики
