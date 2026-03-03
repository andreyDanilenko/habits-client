## 1. Системный анализ

- **Технологический стек фронтенда**
  - **Фреймворк**: `Vue 3` (Composition API, SFC).
  - **Состояние**: `Pinia` (централизованные сторы, в т.ч. `auth`, `workspace` и доменные сущности).
  - **Роутинг**: `vue-router` (`src/app/router/index.ts`) с гардом `authGuard` и доменными гард‑функциями (права доступа, включённость модулей).
  - **HTTP‑клиент**: `axios` в обёртке `ApiClient` (`src/shared/api/client.ts`).
  - **Точка входа**: `src/main.ts`.

- **Жизненный цикл приложения (`src/main.ts`)**
  - Инициализация темы: `initTheme()`.
  - Создание экземпляров: `const app = createApp(App)`, `const pinia = createPinia()`.
  - Подключение `pinia`.
  - Регистрация обработчика неавторизованных запросов:
    - `api.setUnauthorizedHandler(async () => handleUnauthorized(router))`.
    - На любой `401` фронтенд централизованно выполняет сценарий выхода/редиректа.
  - Отложенная инициализация приложения:
    - Динамический импорт `useAuthStore` из `@/features/auth`.
    - `await authStore.initAuth()` — получение текущего пользователя / проверка сессии.
    - Подключение роутера: `app.use(router)`.
    - `await router.isReady()` и `app.mount('#app')`.

- **Роутинг и модули (`src/app/router/index.ts`, `src/app/modules/config.ts`)**
  - Базовые публичные роуты:
    - `/login`, `/register` — публичные страницы, `meta.public = true`.
  - Базовые приватные роуты:
    - `/settings`, `/workspace-settings`, `/workspace-modules`, `/billing`, `/admin` и т.д. c `meta.requiresAuth = true`.
    - Дополнительные гард‑функции:
      - `authGuard` — проверка авторизации на всех приватных роутингах.
      - `requireAdmin()` — проверка глобальной роли ADMIN.
      - `requireOwnerOrAdmin()` — проверка прав на управление воркспейсом.
      - `requireModuleEnabled(getAvailableModules)` — проверка, включён ли модуль в текущем воркспейсе.
      - `requirePermission(...)` — проверка точечных прав (permissions).
  - Динамические модульные роуты:
    - Массив `modules` описывает модули (`habits`, `crm`, `projects`, `notes`, и др.).
    - Для каждого модуля в рантайме генерируются `RouteRecordRaw`:
      - `path`, `name`, `component`, `meta.module`.
      - `beforeEnter`:
        - Проверка включённости модуля.
        - Проверка прав доступа (permissions), если заданы.
  - Редиректы:
    - `/` → `/habits/dashboard`.
    - `/habits` → `/habits/dashboard`.
    - `/crm` → `/crm/contacts`.
    - `/notes` → `/notes/list`.
    - Редиректы старых маршрутов (`/calendar`, `/journal`, …) на новые внутри модуля `habits`.

- **Глобальный макет (`src/app/App.vue`)**
  - Структура:
    - `AppHeader` (шапка), `AppSidebar` (сайдбар) для авторизованной зоны.
    - `router-view` внутри `main` — отрисовка конкретной страницы.
    - Переходы с анимацией (`transition name="fade"`).
    - `ModalProvider` — глобальный провайдер модальных окон.
  - Скрытие шапки/сайдбара на публичных страницах:
    - `showHeader = route.name !== 'Login' && route.name !== 'Register'`.

- **HTTP‑клиент и обработка ошибок (`src/shared/api/client.ts`)**
  - Экземпляр `axios`:
    - `baseURL = import.meta.env.VITE_API_URL ?? ''` — базовый URL бэкенда.
    - `withCredentials: true` — аутентификация на куках.
  - Переключатель моков:
    - `USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'`.
    - При `true` вызовы делегируются в `mockApi` (`src/shared/api/mock-client.ts`), что позволяет поднимать фронт без живого бэкенда.
  - Обработчик 401:
    - Интерцептор ответа проверяет `error.response?.status === 401`.
    - Вызывает зарегистрированный `unauthorizedHandler`, либо редиректит на `/login`.
  - Работа с `X-Workspace-ID`:
    - `setWorkspaceId(id)` выставляет заголовок `X-Workspace-ID` для всех запросов.
    - Используется на уровне `workspaceStore` при переключении текущего воркспейса.
  - Формат ожидаемого ответа:
    - Все методы (`get`, `post`, `put`, `delete`) ожидают на бэкенде ответ вида:
      - `{ status: string; data?: T }`.
    - Возвращаемое значение — только `data` приведённого типа `T`.

- **Слоистая структура для работы с API**
  - **Слой описания эндпоинтов** (`src/shared/api/endpoints.ts`):
    - Чистые константы/функции, строящие URL на основе `workspaceId`, `entityId` и т.д.
    - Не содержат логики HTTP‑запросов.
  - **HTTP‑клиент** (`api`):
    - Унифицированные методы `get`, `post`, `put`, `delete`.
    - Реализует интерцепторы, моки, заголовки.
  - **Доменные сервисы** (`entities/*/api/*-service.ts`, `features/*/api`):
    - Инкапсулируют работу с конкретным ресурсом.
    - Формируют query‑параметры, собирают URL из `API_ENDPOINTS`, приводят ответы к доменным типам.
  - **Композиционные хуки / модели страниц** (`features/*/model/*`, `pages/*`):
    - Управляют состоянием страниц (загрузка, ошибки, пагинация, фильтры).
    - Вызывают доменные сервисы.
  - **UI‑компоненты** (`features/*/ui`, `widgets/*`, `pages/*/ui`):
    - Используют композиционные хуки, не знают деталей API.

- **Пример вертикали (CRM → Контакты)**
  - **Эндпоинт**: `API_ENDPOINTS.CRM.CONTACTS(workspaceId)` и `API_ENDPOINTS.CRM.CONTACT(workspaceId, id)`.
  - **Сервис**: `src/entities/contact/api/contact-service.ts`:
    - Сбор query‑параметров (`search`, `page`, `limit`, `sortBy`, `sortOrder`, `companyId`).
    - Запросы через `api.get/post/put/delete`.
  - **Модель страницы**: `src/features/contacts/model/use-contacts-page.ts`:
    - Хранит локальное состояние (список контактов, пагинация, фильтры).
    - Вызывает `contactService` и обрабатывает ошибки.
  - **Страницы/виджеты**:
    - `pages/crm/ui/CrmContactsPage.vue`, `features/contacts/ui/ContactsTableWidget.vue` и др.

---

## 2. Спецификация фронтенд‑реализации API

### 2.1. Общие принципы

- **Базовый URL**
  - Определяется переменной окружения `VITE_API_URL`.
  - Пример: `VITE_API_URL="http://localhost:8080"`.

- **Версионирование**
  - Все эндпоинты строятся на основе префикса:
    - `const apiV1 = '/api/v1'`.

- **Формат ответов бэкенда (ожидаемый фронтендом)**
  - Успешный ответ:
    - `HTTP 2xx` + тело `{ status: 'ok' | string; data: <payload> }`.
  - Ошибки:
    - `HTTP 4xx/5xx` + тело ошибки произвольного формата.
    - Фронтенд полагается на HTTP‑код и перехват `401`.

- **Аутентификация и сессия**
  - Используются cookie (`withCredentials: true`).
  - Токены в сторе обозначены как `'cookie-based'`, т.к. реальный токен хранится в httpOnly‑куках.
  - Для запросов, не требующих авторизации (`/auth/login`, `/auth/register`), куки не обязательны.

- **Выбор воркспейса**
  - Текущий воркспейс хранится в `workspaceStore`.
  - При смене воркспейса:
    - Вызывается `api.setWorkspaceId(currentWorkspace.id)`.
    - Все последующие запросы включают заголовок `X-Workspace-ID`.
  - Для эндпоинтов, в URL которых уже есть `:workspaceId`, заголовок дублирует контекст и может использоваться на бэкенде как дополнительная проверка.

---

### 2.2. Модель авторизации (`AUTH`)

- **Эндпоинты (`API_ENDPOINTS.AUTH`)**
  - `LOGIN`: `POST /api/v1/auth/login`
  - `REGISTER`: `POST /api/v1/auth/register`
  - `LOGOUT`: `POST /api/v1/auth/logout`
  - `REFRESH`: `POST /api/v1/auth/refresh`
  - `ME`: `GET /api/v1/auth/me`

- **Сервис (`src/features/auth/api/auth-service.ts`)**
  - **Типы**
    - `LoginDto`, `RegisterDto`, `AuthResponse` — экспортируются из `@/features/auth`.
    - `AuthDataResponse` — внутренний тип `{ user: User; expires_in?: number }`.
  - **Методы**
    - `login(credentials: LoginDto): Promise<AuthResponse>`
      - Запрос: `api.post<AuthDataResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)`.
      - Ответ: объект `AuthResponse`:
        - `accessToken: 'cookie-based'`
        - `refreshToken: 'cookie-based'`
        - `user: User` (из `response.user`).
    - `register(data: RegisterDto): Promise<AuthResponse>`
      - Аналогично `login`, но на эндпоинт `REGISTER`.
    - `logout(): Promise<void>`
      - Запрос: `api.post(API_ENDPOINTS.AUTH.LOGOUT)`.
      - Ответ: пустой (`void`).
    - `refresh(refreshToken: string): Promise<AuthResponse>`
      - Запрос: `api.post<AuthDataResponse>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken })`.
      - Ответ: `AuthResponse` в том же формате.

- **Ожидаемые структуры запросов**
  - `LoginDto` (примерная форма):
    - `{ email: string; password: string }` или аналогичная структура.
  - `RegisterDto`:
    - `{ email: string; password: string; name?: string }` (конкретная схема см. в `features/auth/types/auth`).

- **Поведение при `401`**
  - Любой запрос через `api.*`, получивший `401`, вызывает:
    - `handleUnauthorized(router)` (зарегистрировано в `main.ts`).
  - Типовой сценарий:
    - Очистка auth‑стора.
    - Редирект на `/login` с сохранением `redirect`‑URL.

---

### 2.3. Воркспейсы и общие ресурсы (`WORKSPACE`, `ADMIN`)

- **Эндпоинты `WORKSPACE` (`API_ENDPOINTS.WORKSPACE`)**
  - `BASE`: `GET/POST /api/v1/workspaces`
    - `GET` — список воркспейсов текущего пользователя.
    - `POST` — создание воркспейса.
  - `CURRENT`: `GET /api/v1/workspaces/current`
    - Возвращает текущий активный воркспейс.
  - `MY_LICENSES`: `GET /api/v1/workspaces/me/module-licenses`
    - Лицензии/подписки пользователя по модулям.
  - `MEMBERS(workspaceId)`: CRUD по участникам воркспейса:
    - `GET /api/v1/workspaces/:workspaceId/members` — список.
    - `POST /api/v1/workspaces/:workspaceId/members` — приглашение/создание.
    - `PUT /api/v1/workspaces/:workspaceId/members/:id` — обновление ролей (через роутер это не видно, но соответствует REST‑паттерну).
    - `DELETE /api/v1/workspaces/:workspaceId/members/:id` — удаление.
  - `SWITCH(workspaceId)`: `POST /api/v1/workspaces/:workspaceId/switch`
    - Смена активного воркспейса.
  - `MODULES(workspaceId)`: `GET/POST /api/v1/workspaces/:workspaceId/modules`
    - `GET` — список модулей и их статусов.
    - `POST` — включение модуля.
  - `MODULE(workspaceId, moduleCode)`: `DELETE /api/v1/workspaces/:workspaceId/modules/:moduleCode`
    - Отключение модуля.
  - `NOTES(workspaceId)`: `GET/POST /api/v1/workspaces/:workspaceId/notes`
    - Список/создание заметок.
  - `NOTE(workspaceId, noteId)`: `GET/PUT/DELETE /api/v1/workspaces/:workspaceId/notes/:noteId`
    - CRUD заметки.
  - `JOURNAL(workspaceId)`: `GET/POST /api/v1/workspaces/:workspaceId/journal`
    - Список/создание записей дневника.
  - `JOURNAL_ENTRY(workspaceId, entryId)`: `GET/PUT/DELETE /api/v1/workspaces/:workspaceId/journal/:entryId`
    - CRUD записи дневника.
  - `CURRENCIES`, `CURRENCY`:
    - `GET/POST /api/v1/workspaces/:workspaceId/currencies`.
    - `GET/PUT/DELETE /api/v1/workspaces/:workspaceId/currencies/:currencyId`.
  - `COUNTERPARTIES`, `COUNTERPARTY`:
    - `GET/POST /api/v1/workspaces/:workspaceId/counterparties`.
    - `GET/PUT/DELETE /api/v1/workspaces/:workspaceId/counterparties/:counterpartyId`.

- **Эндпоинты `ADMIN` (`API_ENDPOINTS.ADMIN`)**
  - `WORKSPACES`: `GET /api/v1/admin/workspaces`
    - Список всех воркспейсов (для глобальных администраторов).
  - `USERS`: `GET /api/v1/admin/users`
    - Список всех пользователей.
  - `USER(id)`: `DELETE /api/v1/admin/users/:id`
    - Удаление пользователя.
  - `USER_LICENSES(userId)`: `POST /api/v1/admin/users/:userId/licenses`
    - Выдача лицензий/доступов пользователю.
  - Доступ ограничен гардом `requireAdmin()` в роутере.

---

### 2.4. CRM: контакты, компании, сделки, пайплайны, активности (`CRM`)

- **Общие принципы**
  - Все CRM‑эндпоинты привязаны к `workspaceId`.
  - Используются в доменных сервисах `entities/contact/api/contact-service.ts`, `entities/company/api/company-service.ts`, `entities/deal/api/deal-service.ts`, `entities/deal/api/pipeline-service.ts`, `entities/activity/api/activity-service.ts`.

- **Контакты (`API_ENDPOINTS.CRM.CONTACTS/CONTACT`)**
  - `CONTACTS(workspaceId)`: 
    - `GET /api/v1/workspaces/:workspaceId/contacts`
      - Query:
        - `search?: string`
        - `page?: number`
        - `limit?: number`
        - `sortBy?: string`
        - `sortOrder?: 'asc' | 'desc'`
        - `companyId?: string`
      - Ответ (`ContactsListResponse`):
        - `{ contacts: Contact[]; total: number }`.
    - `POST /api/v1/workspaces/:workspaceId/contacts`
      - Тело: `CreateContactDto`.
      - Ответ: созданный `Contact`.
  - `CONTACT(workspaceId, id)`:
    - `GET /api/v1/workspaces/:workspaceId/contacts/:id` — получение контакта.
    - `PUT /api/v1/workspaces/:workspaceId/contacts/:id` — обновление (`UpdateContactDto`).
    - `DELETE /api/v1/workspaces/:workspaceId/contacts/:id` — удаление.

- **Компании (`API_ENDPOINTS.CRM.COMPANIES/COMPANY`)**
  - `COMPANIES(workspaceId)`:
    - `GET /api/v1/workspaces/:workspaceId/companies` — список.
    - `POST /api/v1/workspaces/:workspaceId/companies` — создание.
  - `COMPANY(workspaceId, id)`:
    - `GET/PUT/DELETE /api/v1/workspaces/:workspaceId/companies/:id`.
  - Связь компании и контактов:
    - `COMPANY_ATTACH_CONTACT(workspaceId, companyId, contactId)`:
      - `POST /api/v1/workspaces/:workspaceId/companies/:id/contacts/:contactId`.
    - `COMPANY_DETACH_CONTACT(workspaceId, companyId, contactId)`:
      - `DELETE /api/v1/workspaces/:workspaceId/companies/:id/contacts/:contactId`.

- **Сделки и пайплайны (`API_ENDPOINTS.CRM.DEALS`, `PIPELINES`, `PIPELINE_STAGES` …)**
  - `DEALS(workspaceId)`:
    - `GET /api/v1/workspaces/:workspaceId/deals` — список сделок.
    - `POST /api/v1/workspaces/:workspaceId/deals` — создание сделки.
  - `DEAL(workspaceId, id)`:
    - `GET/PUT/DELETE /api/v1/workspaces/:workspaceId/deals/:id`.
  - `PIPELINES(workspaceId)`:
    - `GET /api/v1/workspaces/:workspaceId/pipelines` — список пайплайнов.
    - `POST /api/v1/workspaces/:workspaceId/pipelines` — создание.
  - `PIPELINE(workspaceId, pipelineId)`:
    - `GET/PUT/DELETE /api/v1/workspaces/:workspaceId/pipelines/:pipelineId`.
  - `PIPELINE_STAGES(workspaceId, pipelineId)`:
    - `GET /api/v1/workspaces/:workspaceId/pipelines/:pipelineId/stages` — список стадий.
    - `POST /api/v1/workspaces/:workspaceId/pipelines/:pipelineId/stages` — создание стадии.
  - `PIPELINE_STAGE(workspaceId, pipelineId, stageId)`:
    - `GET/PUT/DELETE /api/v1/workspaces/:workspaceId/pipelines/:pipelineId/stages/:id`.
  - `PIPELINE_STAGES_REORDER(workspaceId, pipelineId)`:
    - `POST /api/v1/workspaces/:workspaceId/pipelines/:pipelineId/stages/reorder` — изменение порядка стадий.

- **Активности (`API_ENDPOINTS.CRM.ACTIVITIES/ACTIVITY/ACTIVITY_IMPORTANT`)**
  - `ACTIVITIES(workspaceId)`:
    - `GET /api/v1/workspaces/:workspaceId/activities` — лента активностей.
    - `POST /api/v1/workspaces/:workspaceId/activities` — создание активности (звонок, встреча, задача и т.д.).
  - `ACTIVITY(workspaceId, id)`:
    - `GET/PUT/DELETE /api/v1/workspaces/:workspaceId/activities/:id`.
  - `ACTIVITY_IMPORTANT(workspaceId, id)`:
    - `POST /api/v1/workspaces/:workspaceId/activities/:id/important` — переключение флага "важно".

---

### 2.5. Проекты (`PROJECTS`)

- **Эндпоинты (`API_ENDPOINTS.PROJECTS`)**
  - `LIST(workspaceId)`:
    - `GET /api/v1/workspaces/:workspaceId/projects` — список проектов.
    - `POST /api/v1/workspaces/:workspaceId/projects` — создание проекта.
  - `DETAIL(workspaceId, projectId)`:
    - `GET/PUT/DELETE /api/v1/workspaces/:workspaceId/projects/:projectId`.
  - `ENTITIES(workspaceId, projectId)`:
    - `GET /api/v1/workspaces/:workspaceId/projects/:projectId/entities` — список связанных сущностей (сделки, контакты и т.д.).
    - `POST /api/v1/workspaces/:workspaceId/projects/:projectId/entities` — привязка сущности.
  - `DETACH_ENTITY(workspaceId, projectId, entityType, entityId)`:
    - `DELETE /api/v1/workspaces/:workspaceId/projects/:projectId/entities/:entityType/:entityId` — отвязка.
  - `BY_ENTITY(workspaceId, entityType, entityId)`:
    - `GET /api/v1/workspaces/:workspaceId/entities/:entityType/:entityId/projects` — проекты, связанные с конкретной сущностью.

- **Фронтенд‑слой**
  - `entities/project/api/project-service.ts`:
    - Инкапсулирует вызовы `LIST`, `DETAIL`, `ENTITIES`, `DETACH_ENTITY`, `BY_ENTITY`.
  - `features/projects/model/*`:
    - Комбинация сервисов и локального состояния (выбор сущностей, открытие модалок).
  - `pages/projects/*`:
    - Конкретные страницы (список проектов, детальная страница, CRM‑срез по проекту).

---

### 2.6. Привычки и личная продуктивность (`HABITS`, `JOURNAL`, `NOTES`)

- **Эндпоинты `HABITS` (`API_ENDPOINTS.HABITS`)**
  - `BASE(workspaceId)`:
    - `GET /api/v1/workspaces/:workspaceId/habits` — список привычек.
    - `POST /api/v1/workspaces/:workspaceId/habits` — создание привычки.
  - `DETAIL(workspaceId, habitsId)`:
    - `GET/PUT/DELETE /api/v1/workspaces/:workspaceId/habits/:habitId`.
  - `COMPLETE(workspaceId, habitsId)`:
    - `POST /api/v1/workspaces/:workspaceId/habits/:habitId/complete` — отметка выполнения.
  - `TOGGLE(workspaceId, habitsId)`:
    - `POST /api/v1/workspaces/:workspaceId/habits/:habitId/toggle` — вкл/выкл привычки.
  - `STATS(workspaceId, habitsId)`:
    - `GET /api/v1/workspaces/:workspaceId/habits/:habitId/stats` — статистика конкретной привычки.
  - `COMPLETIONS(workspaceId)`:
    - `GET /api/v1/workspaces/:workspaceId/habits/completions` — сводная статистика выполнений.
  - `CALENDAR(workspaceId)`:
    - `GET /api/v1/workspaces/:workspaceId/habits/calendar` — календарь привычек.

- **Журнал и заметки (`WORKSPACE.JOURNAL`, `WORKSPACE.NOTES`)**
  - См. раздел 2.3 — используются виджетами `journal` и `notes`:
    - `pages/habits/journal/*`, `widgets/journal/*`, `pages/notes/*`.

---

### 2.7. Логи системы (`/api/v1/logs`) — административный модуль

- **Эндпоинты (по данным бэкенда)**
  - `GET /api/v1/logs` — получение логов.
  - `POST /api/v1/logs/sync` — форсированная синхронизация логов в БД.
- **Статус на фронтенде**
  - В `API_ENDPOINTS` соответствующих констант пока нет.
  - Для добавления:
    - Расширить `API_ENDPOINTS` секцией `LOGGER`:
      - `LOGS: apiV1 + '/logs'`
      - `SYNC: apiV1 + '/logs/sync'`
    - Создать сервис `entities/logger/api/logger-service.ts` или `features/admin-logs/api`.
    - Ограничить доступ гардом `requireAdmin()` и/или отдельными permissions.

---

## 3. Документация по структуре фронтенда и работе с API

### 3.1. Структура каталогов (в контексте API)

- **`src/shared/api`**
  - `client.ts` — базовый `ApiClient` (axios, моки, интерцепторы, workspace‑header).
  - `endpoints.ts` — типобезопасные константы URL для всех доменов.
  - `mock-client.ts` — реализация мокового API (используется при разработке/демо).

- **`src/entities/*/api`**
  - Для каждой доменной сущности (`contact`, `company`, `deal`, `project`, `activity`, `habit`, и т.д.):
    - `*-service.ts` — тонкий слой поверх `api` + `API_ENDPOINTS`.
    - Ответы приводятся к типам из `entities/*/types`.

- **`src/features/*/model`**
  - Композиционные функции, связывающие:
    - доменные сервисы,
    - сторы (`Pinia`),
    - локальное состояние страниц.

- **`src/pages/*`**
  - Страницы верхнего уровня (маршруты).
  - Подключают UI‑виджеты и используют композиционные функции из `features/*`.

---

### 3.2. Типичный паттерн добавления нового эндпоинта

- **Шаг 1. Добавить константу в `API_ENDPOINTS`**
  - Пример:
    - В секции `CRM`:
      - `TASKS: (workspaceId: string) => apiV1 + \`/workspaces/${workspaceId}/tasks\``.

- **Шаг 2. Создать/расширить доменный сервис**
  - В `entities/task/api/task-service.ts`:
    - Импортировать `api` и `API_ENDPOINTS`.
    - Описать интерфейсы запросов/ответов (`Task`, `TasksListParams`, `TasksListResponse`).
    - Сформировать методы:
      - `getList(params)`, `getById(workspaceId, id)`, `create`, `update`, `delete`.

- **Шаг 3. Создать композиционную функцию на уровне `features`**
  - Например, `features/tasks/model/use-tasks-page.ts`:
    - Управлять локальным состоянием (фильтры, пагинация, загрузка, ошибки).
    - Вызывать методы `taskService`.
    - Экспортировать всё необходимое для UI.

- **Шаг 4. Подключить к странице и роутеру**
  - Создать страницу `pages/tasks/ui/TasksPage.vue`, которая использует `useTasksPage()`.
  - Добавить роут в `app/modules/config.ts` внутри нужного модуля.
  - Указать `meta.module` и, при необходимости, `permissions`.

---

### 3.3. Обработка ошибок и UX

- **401 Unauthorized**
  - Обрабатывается глобально:
    - Интерцептор `ApiClient` → `unauthorizedHandler` → `handleUnauthorized(router)`.
  - Рекомендации:
    - Показывать пользователю понятное уведомление ("Сессия истекла").
    - Возвращать пользователя на страницу входа с возможностью вернуться на исходный URL.

- **4xx/5xx ошибки**
  - На уровне сервисов:
    - Ошибки пробрасываются, чтобы композиционные функции могли:
      - Поставить `isError = true`.
      - Очистить данные.
  - На уровне UI:
    - Показывать сообщения об ошибке и кнопки повтора (retry).

---

### 3.4. Тестирование интеграции фронтенда и API

- **Локальная разработка**
  - Поднять бэкенд (`go run ./cmd/api/main.go`).
  - Убедиться, что маршруты доступны:
    - `/api/v1/auth/*`
    - `/api/v1/workspaces/*`
    - `/api/v1/workspaces/:workspaceId/contacts`, `/companies`, `/deals`, `/pipelines`, `/activities`, `/habits`, `/journal`, `/notes`, `/projects`, …
  - Настроить `.env` фронтенда:
    - `VITE_API_URL="http://localhost:8080"`.

- **Использование моков**
  - При отсутствии живого бэкенда:
    - Установить `VITE_USE_MOCK_API="true"`.
    - Реализовать нужные маршруты в `mock-client.ts`.

---

### 3.5. Краткий обзор готовых доменов и их API

- **AUTH**: логин, регистрация, логаут, refresh, `me`.
- **WORKSPACE**: управление воркспейсами, участниками, модулями, валютами, контрагентами, заметками, журналом.
- **ADMIN**: список воркспейсов и пользователей, удаление пользователей, выдача лицензий.
- **CRM**: контакты, компании, сделки, пайплайны и стадии, активности, важные активности.
- **PROJECTS**: проекты, их сущности, связи между сущностями и проектами.
- **HABITS & JOURNAL & NOTES**: привычки, статистика, календарь, личный журнал и заметки.

Эта спецификация описывает текущую структуру фронтенда и его взаимодействие с готовым REST API. Для новых модулей рекомендуется строго следовать описанным паттернам (слой `API_ENDPOINTS` → доменный сервис → композиционные функции → страницы/виджеты).

