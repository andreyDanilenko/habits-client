## PLAN_ROLE_STAGE_2_CONFIGS — Конфиги прав для Habits и Projects (Этап 2)

### Цель этапа

Расширить типобезопасные конфиги прав (как `CRM_PERMISSIONS`) для модулей **Habits** и **Projects** и внедрить проверки прав в их UI-компоненты через `PermissionGuard`.

---

### 1. Расширение конфигов прав (`features/permissions/config.ts`)

- **Добавить конфиг для Habits:**

```ts
import type { PermissionString } from '@/entities/role'

export const HABITS_PERMISSIONS = {
  // Привычки
  habitCreate: 'habits:habit:create' as PermissionString,
  habitRead: 'habits:habit:read' as PermissionString,
  habitUpdate: 'habits:habit:update' as PermissionString,
  habitDelete: 'habits:habit:delete' as PermissionString,
  habitComplete: 'habits:habit:complete' as PermissionString,

  // Дневник
  journalCreate: 'habits:journal:create' as PermissionString,
  journalRead: 'habits:journal:read' as PermissionString,
  journalUpdate: 'habits:journal:update' as PermissionString,
  journalDelete: 'habits:journal:delete' as PermissionString,
} as const
```

- **Добавить конфиг для Projects:**

```ts
export const PROJECTS_PERMISSIONS = {
  projectCreate: 'projects:project:create' as PermissionString,
  projectRead: 'projects:project:read' as PermissionString,
  projectUpdate: 'projects:project:update' as PermissionString,
  projectDelete: 'projects:project:delete' as PermissionString,
  entityAttach: 'projects:entity:attach' as PermissionString,
  entityDetach: 'projects:entity:detach' as PermissionString,
} as const
```

> Все значения должны строго соответствовать строкам из `permission_catalog` (см. JSON ответа каталога).

---

### 2. Интеграция прав в UI модуля Habits

**Цель:** защитить основные действия в Habits и Journal через `PermissionGuard` и `HABITS_PERMISSIONS`.

Рекомендованные точки интеграции:

- Страница списка привычек (`pages/habits/list` + соответствующие `features/habits/ui`):
  - Кнопка “Создать привычку”:
    - обернуть в `<PermissionGuard :permission="HABITS_PERMISSIONS.habitCreate">`.
  - Действия “Редактировать/Удалить привычку”:
    - `HABITS_PERMISSIONS.habitUpdate` / `HABITS_PERMISSIONS.habitDelete`.

- Действие “Отметить выполнение привычки”:
  - Кнопки/иконки “выполнено”:
    - обернуть в `PermissionGuard :permission="HABITS_PERMISSIONS.habitComplete"`.

- Журнал (`pages/habits/journal` и связанные компоненты):
  - “Создать запись” → `HABITS_PERMISSIONS.journalCreate`.
  - “Редактировать запись” → `HABITS_PERMISSIONS.journalUpdate`.
  - “Удалить запись” → `HABITS_PERMISSIONS.journalDelete`.

> Везде использовать алиасы и общий `PermissionGuard` (`import { PermissionGuard } from '@/features/permissions'`), без “сырых” строк.

---

### 3. Интеграция прав в UI модуля Projects

**Цель:** защитить создание/редактирование/удаление проектов и привязку сущностей к проекту.

Рекомендованные точки интеграции:

- Список проектов (`pages/projects` + `features/projects/ui/ProjectsListPage.vue`):
  - Кнопка “Создать проект”:
    - `PermissionGuard :permission="PROJECTS_PERMISSIONS.projectCreate"`.
  - Действия “Редактировать/Удалить проект”:
    - `PROJECTS_PERMISSIONS.projectUpdate` / `PROJECTS_PERMISSIONS.projectDelete`.

- Детальная страница проекта (`pages/projects/detail`):
  - Управление общими данными проекта (редактирование формы) → `projectUpdate`.
  - Удаление проекта → `projectDelete`.

- Привязка сущностей к проекту (`features/projects/ui/ProjectEntityPanel.vue` и модалки привязки):
  - Кнопки “Привязать к проекту” → `PROJECTS_PERMISSIONS.entityAttach`.
  - Кнопки “Отвязать от проекта” → `PROJECTS_PERMISSIONS.entityDetach`.

---

### 4. Проверка корректности конфигов

- **Ручная проверка:**
  - Сверить все значения в `HABITS_PERMISSIONS` и `PROJECTS_PERMISSIONS` с актуальным `permission_catalog` (ответ, который ты привёл выше):
    - модуль (`moduleCode`),
    - сущность (`entityType`),
    - действие (`action`).

- **Будущее улучшение (из плана):**
  - Подключить сгенерированный тип `PermissionString` из `generated/permission.types.ts` (когда будет сделан бекенд-скрипт),
  - Добавить ESLint правило, запрещающее строки формата `module:entity:action` вне конфигов.

---

### 5. Критерии готовности (Definition of Done для Этапа 2)

- `HABITS_PERMISSIONS` и `PROJECTS_PERMISSIONS` определены в `features/permissions/config.ts`.
- Во всех ключевых местах модуля Habits и Journal:
  - кнопки создания/редактирования/удаления/выполнения защищены через `PermissionGuard` и соответствующие значения `HABITS_PERMISSIONS`.
- Во всех ключевых местах модуля Projects:
  - кнопки создания/редактирования/удаления проекта и привязки/отвязки сущностей защищены через `PermissionGuard` и `PROJECTS_PERMISSIONS`.
- В кодовой базе нет “голых” строк вида `'habits:…'` или `'projects:…'` — только константы из конфигов.

