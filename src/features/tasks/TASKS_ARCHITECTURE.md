# Tasks Module — Архитектура и план (сверка TASK.md + Roadmap)

**Версия:** 1.0  
**Сверка:** TASK.md (ClickUp/Jira), tasks-roadmap.md, TASKS_MODULE_SPEC_CHECKLIST

---

## 1. Стратегия реализации

| Приоритет               | Подход                                   | Обоснование                                           |
| ----------------------- | ---------------------------------------- | ----------------------------------------------------- |
| **Сначала List**        | List View → тестирование → Kanban позже  | Быстрее проверить CRUD, интеграцию с CRM              |
| **Детальная структура** | Заложить фундамент TaskDetail с секциями | Удобно добавлять подзадачи, связи, комментарии, время |
| **Фильтры и типы**      | Базовые сейчас, сложные — позже          | Гибкость типов (TASK.md) и подмодули — итеративно     |

---

## 2. Текущая модель vs Будущая (TASK.md)

### Уже есть в БД и API

| Поле                | Назначение                                 | Статус                        |
| ------------------- | ------------------------------------------ | ----------------------------- |
| `parent_id`         | Подзадачи (как в Jira)                     | ✅ Есть, не используется в UI |
| `type`              | call, meeting, email, lunch, other         | ✅ Фиксированный enum         |
| `status`            | pending, in_progress, completed, cancelled | ✅                            |
| `spent_minutes`     | Тайм-трекинг                               | ✅ Есть, не используется      |
| `task_entity_links` | Связь с CRM (deal, contact, company)       | ✅                            |

### Будущее (заложить структуру)

| Концепция                     | TASK.md / Jira                              | План                                                       |
| ----------------------------- | ------------------------------------------- | ---------------------------------------------------------- |
| **Типы задач**                | Task, Bug, Milestone, Meeting Note, Content | Этап 7+: `task_types` + custom fields по типу              |
| **Pipeline для Kanban**       | Backlog → Analysis → Progress → Test → Done | Этап 5: расширить status или `pipeline_stage_id`           |
| **Подзадачи**                 | parent_id, вложенный список                 | Этап 5: UI для parent_id                                   |
| **Связанные задачи (Blocks)** | Jira: blocks / blocked by                   | Этап 5+: `task_task_links` (task_id, linked_id, link_type) |
| **Комментарии**               | task_comments                               | Этап 5                                                     |
| **Активность/История**        | Changelog + комментарии (как ClickUp)       | Этап 7                                                     |
| **Вложения**                  | task_attachments                            | Этап 7                                                     |
| **Тайм-трекинг**              | spent_minutes, work logs                    | Этап 7                                                     |

---

## 3. Pipeline для Kanban (будущее)

```
Backlog | Analysis | In Progress | Test | Done
```

**Варианты реализации:**

- **A)** Расширить `status`: backlog, analysis, in_progress, test, completed, cancelled
- **B)** Отдельная таблица `task_pipeline_stages` + `stage_id` в tasks (гибче)

**Рекомендация:** На этапе 5 — вариант A (проще). Позже — B при необходимости кастомных воронок.

---

## 4. Структура детальной задачи (TaskDetail)

Фундамент — одна модалка/панель с секциями. ClickUp/Jira: сложная модалка с вкладками или секциями.

### Секции (порядок)

| Секция               | Сейчас                                 | Позже                                                            |
| -------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| **Шапка**            | title, status, priority, assignee, due | + type icon, watchers                                            |
| **Описание**         | description (text)                     | Rich text, markdown                                              |
| **Подзадачи**        | Placeholder                            | parent_id, вложенный список                                      |
| **Связанные задачи** | Placeholder                            | blocks/blocked by                                                |
| **Активность**       | Placeholder                            | Комментарии + история изменений (единый поток, как ClickUp/Jira) |
| **Время**            | Placeholder                            | spent_minutes, work logs                                         |
| **Вложения**         | Placeholder                            | task_attachments                                                 |

### Поведение

- Клик по задаче в списке → **TaskDetailModal** (просмотр)
- Кнопка «Изменить» → **TaskFormModal** (редактирование)
- Fullscreen на мобильных, slide-out на десктопе (как AddEditHabitModal)

---

## 5. Типы задач (TASK.md)

**Сейчас:** Фиксированный enum (call, meeting, email, lunch, other) — достаточно для MVP.

**Позже (Этап 7+):**

- Таблица `task_types` (id, name, icon, color, extends, custom_field_definitions)
- Системные: Task, Bug, Milestone, Meeting Note, Content
- Форма создания/редактирования подстраивается под тип (кастомные поля)

---

## 6. Обновлённый roadmap (этапы)

| Этап    | Фокус                                               | Статус     |
| ------- | --------------------------------------------------- | ---------- |
| **0**   | Backend CRUD, миграция, parent_id, spent_minutes    | ✅         |
| **1**   | Frontend: List, TaskFormModal, страница /tasks      | ✅         |
| **2**   | CRM: TaskEntityPanel в Deal/Contact                 | ✅         |
| **3**   | Permissions, PermissionGuard                        | ✅         |
| **4**   | Reopen, фильтры, URL sync                           | ✅         |
| **4.5** | **TaskDetailModal** — фундамент детальной структуры | 🔄 Текущий |
| **5**   | Kanban, подзадачи (parent_id), комментарии          | Pending    |
| **6**   | Git интеграция                                      | Pending    |
| **7**   | Типы задач, тайм-трекинг, вложения, activity, bulk  | Pending    |

---

## 7. Ссылки

- [TASK.md](./TASK.md) — анализ ClickUp/Jira, модель TaskType
- [tasks-roadmap.md](../../docs/tasks/tasks-roadmap.md) — общий roadmap
- [TASKS_MODULE_SPEC_CHECKLIST](../../../docs/TASKS_MODULE_SPEC_CHECKLIST.md) — чеклист этапов
