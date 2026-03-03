## 1. Общий обзор структуры фронтенда

- **Корень фронта**: `frontend/src`
- Архитектура в стиле **feature-sliced**:
  - `app` — инициализация приложения, роутер, глобальные провайдеры.
  - `pages` — страницы верхнего уровня (маршруты).
  - `widgets` — крупные составные блоки (header, sidebar, dashboard‑виджеты).
  - `features` — пользовательские фичи (таблицы, формы, фильтры, модалки).
  - `entities` — доменные сущности (Contact, Company, Deal, Project, Habit, Workspace, User и т.д.).
  - `shared` — переиспользуемые утилиты, UI‑компоненты, API‑клиент, хелперы.

---

## 2. Структура `app`

- **`app/App.vue`**
  - Глобальный layout:
    - `AppHeader`, `AppSidebar`, `router-view`, `ModalProvider`.
    - Скрытие header/sidebar на страницах `Login` и `Register`.

- **`app/router`**
  - `app/router/index.ts`:
    - Конфигурация `vue-router`:
      - Базовые роуты (`/login`, `/register`, `/settings`, `/workspace-settings`, `/workspace-modules`, `/billing`, `/admin`).
      - Редиректы (`/` → `/habits/dashboard`, `/crm` → `/crm/contacts` и др.).
      - Динамическая регистрация маршрутов из модулей `app/modules/config.ts`.
    - Глобальный гард `authGuard`.
    - Гард‑функции по правам и модулям: `requireAdmin`, `requireOwnerOrAdmin`, `requirePermission`, `requireModuleEnabled`.

- **`app/modules`**
  - `app/modules/config.ts`:
    - Описание модулей (например, `habits`, `crm`, `projects`, `notes`).
    - Для каждого модуля:
      - `id`, `name`, информация для UI.
      - Список маршрутов (`path`, `name`, `component`, `meta`, `permissions`).
    - Используется при генерации роутов и построении меню.

---

## 3. Структура `pages`

`pages` — это **маршрутные страницы**, каждая папка соответствует отдельному разделу, а внутри — index‑файлы и UI‑компоненты.

- **Общие принципы**
  - `pages/<domain>/index.ts` — реэкспорт компонента страницы для ленивой загрузки в роутере.
  - `pages/<domain>/ui/*Page.vue` — Vue‑компоненты страниц.
  - Страницы опираются на `features/*` и `widgets/*`, избегая прямой работы с API.

### 3.1. CRM‑страницы (`pages/crm`)

- **Папка**: `pages/crm`
  - `pages/crm/contacts/index.ts` → `CrmContactsPage.vue`
  - `pages/crm/companies/index.ts` → `CrmCompaniesPage.vue`
  - `pages/crm/deals/index.ts` → `CrmDealsPage.vue`
  - `pages/crm/deal-detail/index.ts` → `CrmDealDetailPage.vue`
  - `pages/crm/company-detail/index.ts` → `CrmCompanyDetailPage.vue`
  - `pages/crm/contact-detail/index.ts` → `CrmContactDetailPage.vue`
  - `pages/crm/pipelines/index.ts` → `CrmPipelinesPage.vue`

- **Назначение**
  - Каждая страница:
    - Подключает соответствующие `features` (таблицы, тулбары, фильтры, формы).
    - Работает с сущностями из `entities/contact`, `entities/company`, `entities/deal`, `entities/activity`.

### 3.2. Проекты (`pages/projects`)

- **Папка**: `pages/projects`
  - `pages/projects/index.ts` → список проектов (`ProjectsListPage.vue`).
  - `pages/projects/detail/index.ts` → детальная страница проекта (`ProjectDetailPage.vue`).
  - `pages/projects/crm/index.ts` → CRM‑срез по проекту (`ProjectCrmPage.vue`).

- **Назначение**
  - Отображение списка и деталей проектов, связей с CRM‑сущностями.
  - Интеграция с `features/projects` и `entities/project`.

### 3.3. Habits / Личный productivity‑модуль (`pages/habits`)

- **Папка**: `pages/habits`
  - `pages/habits/dashboard/index.ts` — дашборд по привычкам.
  - `pages/habits/list/index.ts` — список привычек.
  - `pages/habits/calendar/index.ts` — календарь привычек.
  - `pages/habits/journal/index.ts` — страница журнала.

- **Назначение**
  - Визуализация привычек, статистики и календаря.
  - Использует `widgets/habits`, `widgets/journal`, `features/habits` (если есть).

### 3.4. Workspace / Settings / Billing

- **Папки и файлы**
  - `pages/settings`:
    - `pages/settings/index.ts` → общие пользовательские настройки.
  - `pages/workspace-settings`:
    - `pages/workspace-settings/index.ts` → настройки воркспейса.
    - `pages/workspace-settings/ui/WorkspaceSettingsPage.vue`.
  - `pages/workspace-modules`:
    - `pages/workspace-modules/index.ts` → страница включения/отключения модулей.
    - `pages/workspace-modules/ui/WorkspaceModulesPage.vue`.
  - `pages/billing`:
    - `pages/billing/index.ts` → биллинг/подписки.
  - `pages/admin`:
    - `pages/admin/index.ts` → административная панель (управление пользователями и воркспейсами).

### 3.5. Аутентификация (`pages/login`, `pages/register`)

- **Папки**
  - `pages/login/index.ts` → страница логина.
  - `pages/register/index.ts` → страница регистрации.
- Публичные роуты (`meta.public = true`), layout без header/sidebar.

---

## 4. Структура `widgets`

`widgets` — крупные переиспользуемые блоки интерфейса, которые собирают внутри себя `features` и `entities`.

- **`widgets/header`**
  - `widgets/header/ui/AppHeader.vue` — верхняя панель приложения.
  - Подкомпоненты:
    - `WorkspaceSwitcher.vue` — переключатель воркспейсов.
    - `TodayStats.vue` — краткая статистика за сегодня.
    - `ThemeSwitcher.vue` — переключение темы.
    - `ProfileDropdown.vue` — меню профиля.
    - `Notifications.vue` — уведомления.

- **`widgets/sidebar`**
  - `widgets/sidebar/ui/AppSidebar.vue` — левое меню.
  - Вспомогательные компоненты:
    - `SidebarNavigation.vue` — дерево навигации по модулям/разделам.
    - `SidebarSectionHeader.vue` — заголовки секций.

- **`widgets/habits`**
  - `widgets/habits/ui/TodayHabitsWidget.vue` — виджет "привычки на сегодня".

- **`widgets/journal`**
  - `widgets/journal/ui/QuickJournalWidget.vue` — быстрый ввод записей журнала.
  - `features/journal/ui/JournalEntryCard.vue` — карточка записи журнала.

- **`widgets/stats-overview`**
  - `widgets/stats-overview/ui/StatsOverviewWidget.vue` — сводная статистика.

---

## 5. Структура `features`

`features` — функциональные блоки (таблица контактов, форма компании, фильтры, модалки и т.д.), каждый объединяет:
- `ui` — компоненты представления.
- `model` — композиционные функции/состояние.
- `config` — конфигурация колонок, полей и т.д.
- `api` — при необходимости, тонкие фичевые сервисы (чаще сервисы живут в `entities`).

### 5.1. `features/contacts`

- **Файлы**
  - `features/contacts/index.ts` — реэкспорты.
  - `features/contacts/model/index.ts` — объединение моделей.
  - `features/contacts/model/use-contacts-page.ts` — логика страницы контактов (фильтры, пагинация, загрузка).
  - `features/contacts/model/use-contacts-table-state.ts` — состояние таблицы (сортировка, выбранные строки).
  - `features/contacts/config/columns.ts` — описание колонок таблицы контактов.
  - `features/contacts/ui/index.ts` — реэкспорт UI‑компонентов.
  - UI‑компоненты:
    - `ContactsTableWidget.vue` — таблица контактов.
    - `ContactsToolbar.vue` — панель инструментов (кнопки "создать", фильтры).
    - `ContactsTableRowActions.vue` — действия в строке.
    - `ContactsFiltersPanel.vue` — панель фильтров.
    - `ContactFormModal.vue` — модальное окно создания/редактирования.
    - `ContactQuickViewPanel.vue` — быстрый просмотр контакта.

### 5.2. `features/companies`

- Аналогичная структура:
  - `model/use-companies-page.ts`, `use-companies-table-state.ts`.
  - `config/columns.ts` — колонки таблицы компаний.
  - UI:
    - `CompaniesTableWidget.vue`, `CompaniesToolbar.vue`,
    - `CompaniesTableRowActions.vue`, `CompanyFormModal.vue`.

### 5.3. `features/deals`

- **Файлы**
  - `features/deals/model/index.ts`, `use-deals-page.ts`, `use-deals-table-state.ts`.
  - `features/deals/config/columns.ts` — колонки таблицы сделок.
  - UI:
    - `DealsTableWidget.vue`, `DealsTableRowActions.vue`.
    - `DealsToolbar.vue`.
    - `DealFormModal.vue`.
    - `DealsKanbanView.vue`, `DealKanbanCard.vue`, `DealsAttachContactModal.vue`.

### 5.4. `features/projects`

- **Файлы**
  - `features/projects/index.ts`, `README.md`.
  - `features/projects/model/index.ts`, `useEntityProjects.ts`.
  - `features/projects/config/entityTypes.ts` — описание типов сущностей, которые могут быть привязаны к проектам.
  - UI:
    - `ProjectAddModal.vue`.
    - `ProjectFormModal.vue`.
    - `ProjectEntityPanel.vue` — панель связанных сущностей.

### 5.5. `features/activity`

- **Файлы**
  - `features/activity/index.ts`.
  - `features/activity/model/useActivityFeed.ts` — логика ленты активностей.
  - UI:
    - `ActivityFeed.vue`, `ActivityItem.vue`, `ActivityComposer.vue`.
    - `ActivityFilters.vue`, `ActivityCallModal.vue`.

### 5.6. `features/auth`

- **Файлы (основные)**
  - `features/auth/index.ts` — типы, стор, сервис, guards.
  - `features/auth/model/auth-store.ts` — Pinia‑store авторизации.
  - `features/auth/api/auth-service.ts` — работа с `/auth/*`.
  - `features/auth/lib/guards.ts` — `authGuard`, `handleUnauthorized`, `requireAdmin`.

---

## 6. Структура `entities`

`entities` — слой доменных моделей и API‑сервисов, не зависящий от конкретного UI.

### 6.1. Общий паттерн

- Для каждой сущности:
  - `entities/<name>/types/*.ts` — типы (DTO, доменные модели).
  - `entities/<name>/api/*-service.ts` — сервисы доступа к API, использующие `api` и `API_ENDPOINTS`.
  - `entities/<name>/index.ts` — реэкспорты типов/сервисов/сторов.
  - (опционально) `model` или `store` — логика, не завязанная на конкретные фичи.

### 6.2. Примеры

- **`entities/contact`**
  - `types/contact.ts` — тип `Contact`, DTO для создания/обновления.
  - `api/contact-service.ts` — методы `getList`, `getById`, `create`, `update`, `delete`.

- **`entities/company`**
  - `types/company.ts`.
  - `api/company-service.ts`.

- **`entities/deal`**
  - `types/deal.ts`.
  - `api/deal-service.ts`, `api/pipeline-service.ts`.

- **`entities/project`**
  - `types/project.ts`.
  - `api/project-service.ts`.

- **`entities/activity`**
  - `types/activity.ts`.
  - `api/activity-service.ts`.

- **`entities/workspace`**
  - `types/workspace.ts` — описание воркспейса.
  - store и guards (`requireOwnerOrAdmin`, `requireModuleEnabled`, `requirePermission`) — экспортируются из index.

- **`entities/user`**
  - Типы пользователя, используемые в `auth`.

---

## 7. Структура `shared`

`shared` — переиспользуемые блоки без знания о конкретной бизнес‑логике.

### 7.1. `shared/api`

- `client.ts` — обёртка над `axios`:
  - Настройка `baseURL`, таймаутов, заголовков, `withCredentials`.
  - Интерцептор для обработки `401` (вызов `unauthorizedHandler`).
  - Методы `get/post/put/delete`.
  - Поддержка моков (`USE_MOCK_API`, `mock-client.ts`).
- `endpoints.ts` — константы всех REST‑эндпоинтов (`AUTH`, `WORKSPACE`, `ADMIN`, `CRM`, `PROJECTS`, `HABITS`).
- `mock-client.ts` — фейковый клиент с имитацией ответов.

### 7.2. `shared/ui`

- **Общие компоненты**
  - `FormField.vue` — обёртка над инпутами/лейблами.
  - `Drawer/Drawer.vue` + `Drawer/index.ts` — выезжающая панель.
  - `Dnd/DndList.vue` + `Dnd/index.ts` — drag‑and‑drop список.
  - `KanbanBoard/*` — общий канбан:
    - `KanbanBoard.vue`, `KanbanColumn.vue`, `KanbanBoard.types.ts`, `index.ts`.
  - `DataTable/*` — табличный компонент:
    - `DataTable.vue`, `DataTableCell.vue`, `DataTable.types.ts`, `index.ts`.
  - `Pagination/*` — пагинация:
    - `Pagination.vue`, `Pagination.css`, `index.ts`.

### 7.3. `shared/lib`

- `shared/lib/index.ts` — реэкспорт вспомогательных функций.
- `shared/lib/date.ts` — утилиты работы с датами.
- `shared/lib/use-theme.ts` (по использованию в `main.ts`) — логика инициализации темы.

### 7.4. `styles`

- `styles/main.css` — глобальные стили приложения (tailwind/utility‑классы, базовые токены).

---

## 8. Точка входа `main.ts`

- Файл: `src/main.ts`
  - Импортирует:
    - `App` (`app/App.vue`), `router` (`app/router`), `createPinia`.
    - `api` и `handleUnauthorized`.
    - `initTheme` и глобальные стили.
  - Конфигурирует:
    - Тему (`initTheme()`).
    - Обработчик неавторизованных запросов (`api.setUnauthorizedHandler`).
  - Инициализация:
    - Ленивая загрузка `useAuthStore`.
    - `await authStore.initAuth()`.
    - Подключение роутера и монтирование `#app`.

---

## 9. Как читать эту структуру при разработке

- **Найти страницу**:
  - Ищем маршрут в `app/router/index.ts`.
  - Определяем модуль по `path` (`/crm/...`, `/projects/...`, `/habits/...`).
  - Открываем соответствующую папку в `pages/*`.

- **Понять, какие данные используются**:
  - На странице ищем вызовы композиционных функций (`useSomethingPage`, `useSomething`).
  - Переходим в `features/*/model`.
  - Видим, какие сервисы используются (`entities/*/api/*-service.ts`).

- **Переиспользовать UI‑части**:
  - Ищем их в `widgets/*` или `shared/ui/*`.

Эта схема описывает текущую организацию страниц, папок и утилит во фронтенде и может использоваться как ориентир при добавлении новых модулей и рефакторинге. 

