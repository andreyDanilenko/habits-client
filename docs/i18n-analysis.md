# Анализ перехода на мультиязычность (i18n)

## 1. Текущее состояние

- **i18n не используется** — vue-i18n отсутствует в `package.json`
- **Язык по умолчанию:** русский, текст захардкожен по всему проекту
- **Форматирование дат:** `date-fns` с локалью `ru` в `shared/lib/date.ts`
- **Файлов с русским текстом:** ~150+ (Vue, TS, конфиги)
- **Vue-компонентов:** 221

---

## 2. Категории текстов (полный список)

### 2.1 Централизованные конфиги (высокий приоритет)

| Файл                                    | Строк       | Описание                                                            |
| --------------------------------------- | ----------- | ------------------------------------------------------------------- |
| `app/modules/config.ts`                 | ~33         | Модули, роуты, пункты меню (Привычки, CRM, Контакты, Сделки и т.д.) |
| `entities/workspace/lib/permissions.ts` | Комментарии | Роли, права (технические, но есть комментарии)                      |

### 2.2 Общие библиотеки (критично)

| Файл                                | Строк | Описание                                                         |
| ----------------------------------- | ----- | ---------------------------------------------------------------- |
| `shared/lib/date.ts`                | ~25   | Сегодня, Вчера, минуту назад, Доброе утро, На этой неделе и т.д. |
| `shared/lib/validation.ts`          | 1     | PASSWORD_ERROR                                                   |
| `features/tasks/lib/task-labels.ts` | 11    | Приоритеты, типы задач                                           |
| `entities/task/lib/task-helpers.ts` | 20    | Дубликат task-labels + статусы                                   |

### 2.3 Страницы (pages/)

| Папка/файл                                                | Оценка строк |
| --------------------------------------------------------- | ------------ |
| login, register, verify-email, invite                     | ~50          |
| admin                                                     | ~35          |
| settings, settings/members                                | ~50          |
| crm/\* (deals, contacts, companies, pipelines)            | ~60          |
| tasks                                                     | ~30          |
| projects, workspace-settings, workspace-modules           | ~80          |
| habits, journal, notes, calendar, dashboard               | ~50          |
| billing, create-workspace, module-activation, module-stub | ~90          |

### 2.4 Фичи (features/)

| Фича               | Файлов | Оценка строк                                |
| ------------------ | ------ | ------------------------------------------- |
| tasks              | 15+    | ~120 (формы, фильтры, модалки, комментарии) |
| deals              | 10+    | ~50                                         |
| contacts           | 12+    | ~60                                         |
| companies          | 10+    | ~50                                         |
| activity           | 5+     | ~80 (типы активностей, композер)            |
| habit              | 8+     | ~90                                         |
| journal            | 5+     | ~40                                         |
| projects           | 5+     | ~40                                         |
| pipelines          | 6+     | ~50                                         |
| roles, permissions | 5+     | ~30                                         |
| workspace          | 3+     | ~20                                         |
| notifications      | 3+     | ~30                                         |
| notes              | 3+     | ~15                                         |

### 2.5 Виджеты (widgets/)

| Виджет                                                                 | Строк |
| ---------------------------------------------------------------------- | ----- |
| sidebar (AppSidebar, NavLink)                                          | ~15   |
| header (WorkspaceSwitcher, ThemeSwitcher, ProfileDropdown, TodayStats) | ~25   |
| activity, habits, calendar, journal                                    | ~25   |

### 2.6 Shared UI

| Компонент                                         | Строк |
| ------------------------------------------------- | ----- |
| ConfirmModal, EmptyState, Button                  | ~10   |
| Input, Select, SearchInput, DatePicker, DateInput | ~15   |
| DataTable, Pagination                             | ~15   |
| Drawer, Tooltip                                   | ~5    |

### 2.7 Конфиги колонок и опций

| Файл                                      | Описание                    |
| ----------------------------------------- | --------------------------- |
| `features/deals/config/columns.ts`        | Заголовки таблицы сделок    |
| `features/contacts/config/columns.ts`     | Заголовки таблицы контактов |
| `features/companies/config/columns.ts`    | Заголовки таблицы компаний  |
| `features/projects/config/entityTypes.ts` | Типы сущностей для проектов |

### 2.8 Сообщения из API и ошибки

- `shared/api/client.ts` — комментарии, редиректы
- `features/auth/*` — сообщения об ошибках
- `permission-service`, `notification-service` — fallback-сообщения
- `SettingsMembersPage` — `alert('Не удалось отправить приглашение')`

### 2.9 Специфичные случаи

- **Плюрализация:** `use-task-comments.ts` — «ответ» / «ответа» / «ответов» (3 формы)
- **Интерполяция:** `Нет задач по «${entityName}»`, `К задаче «${title}»`
- **Динамические опции:** `assigneeOptions`, `pipelineOptions` — label приходит из API или формируется
- **Права:** `permission.name` из каталога API — может быть на бэкенде

---

## 3. Оценка объёма

| Категория                        | Уникальных ключей (оценка) | Файлов          |
| -------------------------------- | -------------------------- | --------------- |
| Конфиги модулей/роутов           | ~40                        | 1               |
| Дата/время                       | ~25                        | 1               |
| Задачи (labels, формы, фильтры)  | ~80                        | 10+             |
| CRM (сделки, контакты, компании) | ~150                       | 25+             |
| Привычки, журнал, заметки        | ~100                       | 15+             |
| Активность                       | ~50                        | 5+              |
| Проекты, воронки                 | ~60                        | 10+             |
| Настройки, биллинг, админ        | ~120                       | 15+             |
| Auth (login, register, invite)   | ~40                        | 5+              |
| Shared UI                        | ~50                        | 15+             |
| Виджеты                          | ~40                        | 8+              |
| **Итого**                        | **~750–900 ключей**        | **~150 файлов** |

---

## 4. Оценка сложности

### Низкая сложность

- Замена статичных строк на `$t('key')` в шаблонах
- Централизованные конфиги (modules, columns)
- Простые лейблы (кнопки, заголовки)

### Средняя сложность

- Интерполяция: `$t('tasks.noTasksFor', { name: entityName })`
- Передача `t` в composables (formatDate, task-labels)
- Опции Select — либо ключи в JSON, либо функция `(val) => t('tasks.priority.' + val)`

### Высокая сложность

- **date-fns:** переключение локали по `locale` из i18n (`date-fns/locale/ru`, `en`, etc.)
- **Плюрализация:** vue-i18n поддерживает `$tc` с русскими правилами (one/few/many/zero)
- **Форматирование дат:** `formatDateRu` вызывается в 20+ местах — нужна обёртка с локалью
- **Контент из API:** имена пользователей, названия сделок — не переводим

---

## 5. Лаконичный план перехода

### Этап 1: Инфраструктура (1–2 дня)

1. Установить `vue-i18n@10`
2. Создать `src/i18n/index.ts`:
   - `createI18n` с `locale: 'ru'`, `fallbackLocale: 'ru'`
   - `legacy: false` (Composition API)
3. Подключить в `main.ts`: `app.use(i18n)`
4. Создать `src/i18n/locales/ru.json` — пустой или с 1–2 ключами для проверки

### Этап 2: Конфиги и общие библиотеки (2–3 дня)

1. **modules/config.ts** — заменить `label` на `t('modules.habits')` и т.д., вынести в `ru.json` секцию `modules`
2. **shared/lib/date.ts** — принимать `locale` из i18n, заменить хардкод («Сегодня», «Вчера») на ключи
3. **task-labels.ts** — `priorityLabel(p) => t('tasks.priority.' + p)`, удалить дубликат в `task-helpers.ts`
4. **validation.ts** — `PASSWORD_ERROR` → ключ

### Этап 3: Shared UI и виджеты (2–3 дня)

1. ConfirmModal, EmptyState, Button — пропсы `title`, `message` через `t()`
2. Input, Select — placeholder, «Ничего не найдено» и т.д.
3. Sidebar, Header — пункты меню уже из config, остальное — отдельные ключи

### Этап 4: Фичи по приоритету (5–10 дней)

Рекомендуемый порядок:

1. **tasks** — много повторяющихся лейблов (приоритет, тип, статус)
2. **deals, contacts, companies** — формы, таблицы, фильтры
3. **activity** — типы активностей, композер
4. **habit, journal, notes**
5. **projects, pipelines**
6. **settings, billing, admin**
7. **auth** (login, register, invite)

### Этап 5: Дата и плюрализация

1. Обёртка `useFormatDate()` с `locale` из `useI18n().locale`
2. Плюрализация в `use-task-comments.ts`: `$tc('comments.replyCount', count)`

---

## 6. Структура JSON (пример)

```json
{
  "common": {
    "save": "Сохранить",
    "cancel": "Отмена",
    "delete": "Удалить",
    "edit": "Изменить",
    "close": "Закрыть"
  },
  "modules": {
    "habits": "Привычки",
    "crm": "CRM",
    "contacts": "Контакты",
    "deals": "Сделки"
  },
  "tasks": {
    "priority": {
      "low": "Низкий",
      "medium": "Средний",
      "high": "Высокий",
      "critical": "Критический"
    },
    "type": { "task": "Задача", "bug": "Ошибка" },
    "status": { "pending": "К выполнению", "completed": "Выполнена" },
    "noTasksFor": "Нет задач по «{name}»",
    "noTasks": "Нет связанных задач"
  },
  "date": {
    "today": "Сегодня",
    "yesterday": "Вчера",
    "greeting": {
      "morning": "Доброе утро",
      "afternoon": "Добрый день",
      "evening": "Добрый вечер",
      "night": "Доброй ночи"
    }
  }
}
```

---

## 7. Итоговая оценка

| Метрика                     | Значение                                          |
| --------------------------- | ------------------------------------------------- |
| **Объём работы**            | 750–900 ключей, ~150 файлов                       |
| **Срок (один разработчик)** | 2–3 недели при поэтапной миграции                 |
| **Риски**                   | Дата/плюрализация, контент из API                 |
| **Рекомендация**            | vue-i18n + JSON, начинать с конфигов и shared lib |

---

## 8. Файлы, которые нельзя пропустить

Полный список файлов с русским текстом (по результатам grep):

<details>
<summary>Развернуть список (~150 файлов)</summary>

- app/App.vue, app/modules/config.ts
- main.ts
- shared/lib/date.ts, validation.ts, rich-content.ts
- shared/ui/\* (ConfirmModal, EmptyState, Input, Select, DataTable, DatePicker, Pagination, Drawer, SearchInput, etc.)
- shared/api/client.ts, mock-client.ts, endpoints.ts
- features/tasks/\* (TaskFormModal, TaskList, TaskEntityPanel, TaskDetailModal, TasksFiltersDrawer, TasksToolbar, TaskCard, CommentThread, use-task-comments, task-labels, use-tasks-page, use-tasks-kanban, use-task-entity-panel)
- features/deals/\* (DealFormModal, DealsToolbar, DealsFiltersDrawer, DealsAttachContactModal, DealsKanbanView, use-deal-actions, use-deals-list, use-deal-form, use-deal-detail)
- features/contacts/\* (ContactFormModal, ContactsToolbar, ContactsFiltersDrawer, ContactQuickViewModal, ContactsTableSection, ContactsFiltersPanel, ContactMainInfo, ContactDealsSection)
- features/companies/\* (CompanyFormModal, CompaniesToolbar, CompaniesFiltersDrawer, CompanyTags, CompanyResponsible, CompanyRequisites, CompanyAttachContactForm, CompanyContactsSection)
- features/activity/\* (ActivityComposer, ActivityItem, ActivityFeed, ActivityFilters, ActivityCallModal)
- features/habit/\* (AddEditHabitModal, HabitDetailsModal, MarkCompletionModal, HabitsList, HabitsListItem)
- features/journal/\* (JournalEntryModal, JournalEntryCard, journal-constants, use-journal-page)
- features/notes/\* (NotesList, NoteFormModal, NotesEmptyState)
- features/projects/\* (ProjectFormModal, ProjectEntityPanel, AddEntitiesToProjectModal, entityTypes)
- features/pipelines/\* (PipelineEditor, PipelineList, use-pipeline-stages, use-pipeline-form)
- features/roles/\* (RoleFormModal, RoleCard, RolesList, SystemRolesPermissions)
- features/workspace/\* (WorkspaceCreateModal, use-workspace-settings-page)
- features/notifications/\* (NotificationsDrawer, use-notifications-store)
- features/permissions/\* (use-permission-tree)
- features/auth/\* (guards, auth-store)
- entities/task/lib/task-helpers.ts, entities/task/types/task.ts
- entities/workspace/lib/permissions.ts
- entities/deal, contact, project (types, api)
- pages/_ (login, register, verify-email, invite, admin, settings, crm/_, tasks, projects, habits, journal, notes, calendar, billing, create-workspace, workspace-settings, workspace-modules, module-activation, module-stub)
- widgets/\* (sidebar, header, activity, habits, calendar, journal)

</details>
