# Резюме: Модуль Tasks — что сделано и план внедрения

---

## 1. Что уже сделано

### 1.1. Документация (реорганизация)

| Действие                     | Результат                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Декомпозиция `docs/frontend` | Структура: `spec/`, `tasks/`, `plans/`, `architecture/`, `guides/`, `reports/`, `features/`                                                      |
| Объединение файлов           | `ANIMATE` + `ANIMATION_PATTERNS` → `guides/animation.md`; `SSL` + `SSL_UPDATE` → `guides/ssl.md`; `TRELO` + `TRECKER` → `tasks/tasks-roadmap.md` |
| README-навигация             | `docs/frontend/README.md` — индекс по всей документации                                                                                          |
| Обновление `plans/roles.md`  | Убрано «Наследование ролей» из критичных; добавлена модель: кастомная роль перезаписывает системную                                              |

### 1.2. Задел под Tasks (уже в коде)

| Место                       | Статус                                                                         |
| --------------------------- | ------------------------------------------------------------------------------ |
| `CrmDealDetailPage.vue`     | Вкладка «Задачи» — placeholder «Связанные задачи (в разработке)»               |
| `CrmContactDetailPage.vue`  | Вкладка «Задачи» — `ContactTasksPlaceholder`                                   |
| `entityTypes.ts` (projects) | Закомментирован `task` для привязки к проектам                                 |
| `ActivityItem.vue`          | Тип активности `task`                                                          |
| `spec/api.md`               | Описан паттерн: `API_ENDPOINTS` → `task-service` → `use-tasks-page` → страница |

### 1.3. Спецификации (готовы)

| Документ                               | Содержание                                                                                                 |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `backend/docs/CRM/SPEC_BACK_3.md`      | БД (tasks, task_entity_links, task_tags, comments, watchers, attachments, history, time_entries), API, RLS |
| `backend/docs/CRM/SPEC_FRON_3.md`      | Типы Task, DTO, компоненты (MyTasksPage, TaskCard, TaskFormModal, TaskQuickAdd, виджет в сделке)           |
| `frontend/docs/tasks/tasks-roadmap.md` | Roadmap: Views, иерархия, интеграция с CRM, collaboration, дедлайны                                        |
| `frontend/docs/tasks/index.md`         | E1 — модуль Tasks в общем плане (3–4д backend, frontend)                                                   |

---

## 2. Что нужно для безопасного внедрения

### 2.1. Принципы архитектуры (сохранить)

```
entities/task     → типы, task-service.ts (API)
features/tasks    → use-tasks-page, TaskFormModal, TaskList, TaskCard
pages/tasks       → TasksPage, TaskDetailPage
widgets           → TaskQuickAdd (в header), TaskStatsWidget
```

**Правила:**

- Импорты только вниз: `pages` → `features` → `entities` → `shared`
- API: `API_ENDPOINTS.TASKS(workspaceId)` в `shared/api/endpoints.ts`
- Сервис: `entities/task/api/task-service.ts` — тонкий слой над `api`
- Композиции: `features/tasks/model/use-tasks-page.ts` — состояние, фильтры, вызовы сервиса
- Права: `tasks:task:create`, `tasks:task:read` и т.д. в `permission_catalog` + `TASKS_PERMISSIONS` на фронте

### 2.2. План внедрения (по этапам)

#### Этап 0: Backend (миграции + API)

- [ ] Миграция: таблицы `tasks`, `task_entity_links` (MVP — без tags, comments, watchers, attachments)
- [ ] `permission_catalog`: добавить права `tasks:task:create`, `tasks:task:read`, `tasks:task:update`, `tasks:task:delete`
- [ ] API: `GET/POST /tasks`, `GET/PATCH/DELETE /tasks/:id`, `POST /tasks/:id/complete`
- [ ] Связи: при создании задачи передавать `entities: [{ entityType, entityId }]` → запись в `task_entity_links`
- [ ] Middleware: маппинг эндпоинтов на права

#### Этап 1: Frontend — entities и API

- [ ] `entities/task/types/task.ts` — Task, CreateTaskDto, UpdateTaskDto, TaskEntityLink
- [ ] `shared/api/endpoints.ts` — секция `TASKS`
- [ ] `entities/task/api/task-service.ts` — getList, getById, create, update, delete, complete

#### Этап 2: Frontend — features и страницы

- [ ] `features/tasks/model/use-tasks-page.ts` — список, фильтры, пагинация
- [ ] `features/tasks/ui/TaskFormModal.vue` — создание/редактирование
- [ ] `features/tasks/ui/TaskList.vue` — список с карточками
- [ ] `pages/tasks/` — TasksPage (главная), TaskDetailPage (по желанию на MVP)
- [ ] `app/modules/config.ts` — модуль `tasks` с роутами `/tasks`, `/tasks/:id`
- [ ] `workspace_modules` — добавить код `tasks` для включения в workspace

#### Этап 3: Интеграция с CRM

- [ ] Виджет `TaskEntityPanel` — список задач по `entityType` + `entityId`
- [ ] Заменить placeholder во вкладке «Задачи» в `CrmDealDetailPage`, `CrmContactDetailPage`
- [ ] Кнопка «Быстрая задача» в карточке сделки/контакта — открывает форму с предзаполненной связью

#### Этап 4: Права и модуль

- [ ] `features/permissions/config.ts` — `TASKS_PERMISSIONS`
- [ ] `PermissionGuard` на кнопках создания/редактирования
- [ ] Роут `requireModuleEnabled('tasks')` и `requirePermission(TASKS_PERMISSIONS.taskRead)`

### 2.3. Риски и как их избежать

| Риск                    | Митигация                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Нарушение FSD           | Строго следовать слоям: не импортировать `features` из `entities`, не вызывать API из `pages`                                   |
| Дублирование логики     | Переиспользовать `DataTable`, `Modal`, `Pagination` из `shared/ui`                                                              |
| Раздувание task-service | Вынести comments, attachments в отдельные сервисы при появлении                                                                 |
| Конфликт с activities   | `activity.type = 'task'` — это запись в ленте; `Task` — отдельная сущность. Связь: при создании задачи можно создавать activity |

---

## 3. Порядок работ (рекомендуемый)

1. **Backend MVP** — миграции `tasks` + `task_entity_links`, базовый CRUD API, права в каталоге
2. **Frontend entities** — типы, endpoints, task-service
3. **Frontend features** — use-tasks-page, TaskFormModal, TaskList
4. **Frontend pages** — TasksPage, регистрация модуля
5. **CRM-виджет** — замена placeholder на реальный список задач по сделке/контакту
6. **Права** — TASKS_PERMISSIONS, PermissionGuard, включение модуля в workspace

---

## 4. Ссылки

- [TASKS_MODULE_SPEC_CHECKLIST](../../../docs/TASKS_MODULE_SPEC_CHECKLIST.md) — чеклист этапов и приёмки
- [SPEC_BACK_3](../../../backend/docs/CRM/SPEC_BACK_3.md) — полная спека бэкенда
- [SPEC_FRON_3](../../../backend/docs/CRM/SPEC_FRON_3.md) — полная спека фронтенда
- [tasks/index.md](../tasks/index.md) — общий план задач
- [tasks/tasks-roadmap.md](../tasks/tasks-roadmap.md) — roadmap таск-трекера
- [spec/api.md](../spec/api.md) — паттерн добавления эндпоинта (раздел 3.2)
- [spec/structure.md](../spec/structure.md) — структура FSD
