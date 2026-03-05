## REPORT_PERMISSION_1 — Спринт 1 (инфраструктура прав и ролей)

### 1. Слой API_ENDPOINTS

- Добавлены согласованные с бекендом эндпоинты:
  - `PERMISSIONS.CATALOG(workspaceId)` — каталог прав воркспейса.
  - `ROLES.LIST/DETAIL/PERMISSIONS/INHERIT` — CRUD ролей и наследование.
  - `ASSIGNMENTS.USER_ROLES/USER_ROLE/USER_PERMISSIONS/USER_PERMISSION` — назначения ролей и индивидуальных прав пользователю.
  - `ME.PERMISSIONS(workspaceId)` — эффективные права текущего пользователя.
- Реализовано строго через единый префикс `apiV1`, без дублирования строк URL по коду.

### 2. Доменные сущности (entities)

- `entities/permission`:
  - Тип `Permission` согласован с `PermissionCatalogItem` на бэкенде.
  - Введены структуры `PermissionTree*` для фронтовой группировки прав.
  - Сервис `permissionService.getCatalog(workspaceId)` поверх `API_ENDPOINTS.PERMISSIONS.CATALOG`.
- `entities/role`:
  - Тип `Role` соответствует `WorkspaceRole` на бэке.
  - Тип `PermissionString = \`\${string}:\${string}:\${string}\`` для строковых прав.
  - Сервис `roleService` реализует:
    - `list/getById/getPermissions`,
    - `create/update/delete`,
    - `addInheritance/removeInheritance`.
- `entities/assignment`:
  - Типы `RoleAssignment`, `UserPermission`, `UserRole` соответствуют описанию в PERMISSIONS_FRONTEND.md.
  - Сервис `assignmentService` реализует:
    - чтение и изменение ролей пользователя,
    - выдачу и отзыв индивидуальных прав.
- `entities/workspace`:
  - Добавлен тип `Member` с полем `systemRole`, совпадающим с системными ролями бекенда.

Во всех сущностях используются типы и строки, а не «магические» значения; данные о правах и ролях приходят с сервера, код только группирует и пересобирает их.

### 3. Интеграция авторизации и эффективных прав

- `features/auth/types/auth.ts`:
  - Добавлен тип `EffectivePermissions` (`permissions: string[]; roles: string[]; systemRole`).
- `features/auth/api/auth-service.ts`:
  - Реализован метод `getEffectivePermissions(workspaceId)` → `ME.PERMISSIONS`.
- `features/auth/model/auth-store.ts`:
  - Добавлено состояние `effectivePermissions: EffectivePermissions | null`.
  - В `initAuth()` после успешного `/auth/me` вызывается `loadEffectivePermissions()` для текущего воркспейса.
  - В `logout()` и при `401` состояние прав сбрасывается.
  - Экспортируется метод `loadEffectivePermissions()` для повторной загрузки при смене контекста.
- `entities/workspace/model/workspace-store.ts`:
  - В `switchWorkspace()` после смены воркспейса и загрузки модулей динамически вызывается `authStore.loadEffectivePermissions()`.
  - За счёт этого эффективные права всегда соответствуют активному воркспейсу, без хардкода привязок.

### 4. Фронтовая модель прав и PermissionTree

- `features/permissions/model/use-permission-tree.ts`:
  - Загружает каталог прав через `permissionService.getCatalog` для текущего воркспейса.
  - Формирует `PermissionTree` **исключительно на основе данных с сервера**:
    - группировка по `moduleCode` и `entityType`,
    - человекочитаемое имя действия берётся из `Permission.name`,
    - строка права формируется как `\`\${moduleCode}:\${entityType}:\${action}\` и совпадает с форматом бэка.
  - Не использует хардкодированных словарей названий модулей/сущностей; UI работает на реальных данных и кодах, а локализацию можно добавить отдельно.

### 5. Хуки и UI для проверки прав

- `features/permissions/model/use-permissions.ts`:
  - Использует `authStore.effectivePermissions` как единственный источник истины.
  - Предоставляет:
    - `can(permission: PermissionString)`,
    - `canAny(permissions: PermissionString[])`,
    - `canAll(permissions: PermissionString[])`,
    - а также доступ к списку прав, ролям и `systemRole`.
  - Все проверки выполняются над строковыми правами, пришедшими с сервера, без дублирования логики бекенда в виде констант.
- `features/permissions/ui/PermissionGuard.vue`:
  - Универсальный обёрточный компонент:
    - `permission: PermissionString | PermissionString[]`,
    - `requireAll?: boolean`,
    - `fallback?: Component`.
  - Логика:
    - одиночное право → `can`,
    - массив с `requireAll=true` → `canAll`,
    - массив без `requireAll` → `canAny`.
  - Не содержит специфики модулей; его можно использовать в любых фичах.
- `features/permissions/ui/PermissionTree.vue`:
  - Базовый редактор прав:
    - строит дерево по данным из `usePermissionTree()` без собственных хардкод‑словарей,
    - работает через `v-model` (`modelValue: string[]` строковых прав в формате `module:entity:action`),
    - на изменение чекбоксов эмитит `update:modelValue` с новым набором строковых прав.
  - Компонент не знает о ролях, только о правах; он переиспользуемый и тонкий.

### 6. Архитектурные договорённости, которых придерживается реализация

1. **Чистая слоистая архитектура**:
   - URL и HTTP‑детали инкапсулированы в `shared/api/endpoints.ts` и `api`.
   - Доменные операции — в `entities/*/api/*-service.ts`.
   - Состояние UI и композиционные функции — в `features/*/model`.
   - Компоненты представления — в `features/*/ui`.
2. **Отсутствие бизнес‑хардкода на фронте**:
   - Нет захардкоженных названий модулей, сущностей или прав.
   - Все идентификаторы и человекочитаемые имена приходят с сервера (через `Permission` и связанные структуры).
   - Группировка и формат строкового права строятся алгоритмически из полей ответа.
3. **Один источник истины для прав пользователя**:
   - Только `/me/permissions` определяет, что пользователь может делать.
   - Любая логика проверки прав (`use-permissions`, `PermissionGuard`, будущие guards в роутере и UI) опирается на это API.
   - При смене воркспейса права автоматически перезагружаются.

На текущем этапе полностью закрыта инфраструктурная часть (Спринт 1) для прав и ролей: эндпоинты, типы, сервисы, интеграция с авторизацией и базовые хуки/компоненты для работы с правами без хардкода и с соблюдением существующей архитектуры фронтенда.

---

### 7. Управление ролями на фронтенде (Спринт 3 — первая часть)

- `features/roles`:
  - `model/use-roles-page.ts`:
    - Загружает список ролей текущего workspace через `roleService.list`.
    - Разделяет роли на системные (`isSystem=true`) и кастомные.
    - Предоставляет методы `createRole/updateRole/deleteRole`, которые оборачивают соответствующие методы `roleService` и после операций обновляют список.
  - `model/use-role-editor.ts`:
    - Инкапсулирует локальное состояние формы роли (`name`, `description`, `permissions`).
    - Умеет работать как в режиме создания, так и редактирования существующей роли.
    - На сохранение формирует полезную нагрузку и делегирует вызовы в `use-roles-page` (чистое разделение бизнес‑логики и UI).
  - `ui/RoleCard.vue`:
    - Отображает одну роль (название, описание, маркер «Системная»).
    - Для системных ролей отключено удаление, сохранён только просмотр/редактирование.
  - `ui/RoleFormModal.vue`:
    - Модальное окно создания/редактирования роли.
    - Поля: название, описание, список прав через `PermissionTree`.
    - Работает на `useRoleEditor`, не содержит прямых вызовов API.
  - `ui/RolesList.vue`:
    - Объединяет загрузку ролей, отображение системных/кастомных ролей и управление модалкой.
    - При редактировании роли дополнительно загружает её права через `roleService.getPermissions`, не перегружая список ролей лишними данными.
- Страница `/workspace-settings/roles`:
  - `pages/workspace-settings/roles/ui/WorkspaceRolesPage.vue` — обёртка над `RolesList` в виде карточки в настройках воркспейса.
  - Роут добавлен в `app/router/index.ts`:
    - Путь: `/workspace-settings/roles`, имя: `WorkspaceRoles`.
    - Гард `beforeEnter: requireOwnerOrAdmin()` — доступ только владельцу или админу воркспейса.

При этом:

- API‑слой и доменные сервисы по‑прежнему живут в `entities/*/api`.
- `features/roles` не знает о деталях API и работает через `roleService`.
- Страница `WorkspaceRolesPage` использует только публичный интерфейс `features/roles`.

---

### 8. Этапы реализации: выполнено / осталось

**Выполнено:**

- Спринт 1:
  - Добавлены все необходимые эндпоинты для прав, ролей и назначений.
  - Реализованы доменные сущности и сервисы: `permission`, `role`, `assignment`.
  - Интегрирован `/me/permissions` в `authStore` и `workspace-store` (автообновление прав при старте и смене воркспейса).
- Спринт 2 (частично):
  - Реализована загрузка каталога прав и фронтовая группировка в `PermissionTree`.
  - Реализованы базовые хуки и компоненты для проверки прав (`use-permissions`, `PermissionGuard`).
- Спринт 3 (частично):
  - Реализован базовый CRUD ролей на фронтенде (список, создание, редактирование, удаление кастомных ролей).
  - Создана страница `/workspace-settings/roles` и встроена в существующую структуру настроек.
- Спринт 4 (частично):
  - Реализованы `features/members` (`use-member-roles`, `MemberRoleChips`) на базе `assignmentService` и `roleService`.
  - Реализованы `features/user-permissions` (`use-user-permissions`, `UserPermissionsPanel`) на базе `assignmentService` и `permissionService`.
  - Создана страница `/settings/members`, отображающая участников текущего workspace и позволяющая управлять их кастомными ролями и индивидуальными правами.
- Спринт 5 (частично):
  - Начата интеграция `PermissionGuard` в ключевые CRM‑фичи:
    - кнопка создания контакта (`features/contacts/ui/ContactsToolbar.vue`) защищена правом `crm:contact:create`;
    - кнопка создания компании (`features/companies/ui/CompaniesToolbar.vue`) защищена правом `crm:company:create`;
    - кнопка создания сделки (`features/deals/ui/DealsToolbar.vue`) защищена правом `crm:deal:create`.

**Остаётся реализовать в следующих шагах:**

- Спринт 2:
  - Тесты и доп. сценарии для `PermissionTree` (включая UX‑улучшения, поиск по правам и т.п., если потребуется).
- Спринт 3:
  - Наследование ролей и визуализация дерева наследования (`InheritanceTree.vue`).
  - Возможное вынесение списка системных ролей/их описаний в отдельный источник данных (при необходимости согласовать с бэком).
- Спринт 4:
  - Дополнительные UX‑улучшения страницы `/settings/members` (фильтры, поиск, подтверждения действий) при необходимости.
- Спринт 5:
  - Точечная интеграция `PermissionGuard` и `use-permissions` во все ключевые модули (CRM, Habits, Projects и др.).
  - Опциональные devtools для отладки прав (отображение эффективных прав текущего пользователя, активных ролей и т.п.).
