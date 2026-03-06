## REPORT_PERMISSION_CURRENT — Текущая реализация системы прав и ролей

### 1. Бэкенд-контракты и слой API

- **Контракты данных (согласно PERMISSIONS_FRONTEND.md):**
  - `Permission` (`permission_catalog`), `Role` (`workspace_roles`), `PermissionString`, `RoleAssignment`, `UserPermission`, `UserRole`, `Member`, `EffectivePermissions`.
  - Все эти типы отражены в `entities/*/types` и `features/auth/types`.
- **REST-эндпоинты (слой `API_ENDPOINTS`):**
  - `PERMISSIONS.CATALOG(workspaceId)` → `GET /api/v1/workspaces/:workspaceId/permissions/catalog`.
  - `ROLES.LIST/DETAIL/PERMISSIONS/INHERIT`:
    - список ролей, деталь роли, права роли, CRUD ролей, наследование.
  - `ASSIGNMENTS.USER_ROLES/USER_ROLE/USER_PERMISSIONS/USER_PERMISSION`:
    - назначение/снятие ролей и индивидуальных прав.
  - `ME.PERMISSIONS(workspaceId)`:
    - `GET /api/v1/me/permissions?workspaceId=...` возвращает `EffectivePermissions`.

Все URL сконцентрированы в `shared/api/endpoints.ts` и не дублируются в фичах.

### 2. Entities-слой (типобезопасный доступ к данным)

- **`entities/permission`**
  - Типы:
    - `Permission` (ID, moduleCode, entityType, action, name, isSystem, createdAt),
    - `PermissionTree` с иерархией modules → entities → actions.
  - Сервис:
    - `permissionService.getCatalog(workspaceId): Promise<Permission[]>`.

- **`entities/role`**
  - Типы:
    - `Role` (workspace-роль),
    - `PermissionString = \`\${string}:\${string}:\${string}\``,
    - `RolePermissionsResponse = PermissionString[]`.
  - Сервис:
    - `list(workspaceId)`, `getById(workspaceId, roleId)`,
    - `getPermissions(workspaceId, roleId)`,
    - `create/update/delete`,
    - `addInheritance/removeInheritance` (API готово, UI для наследования пока не реализован).

- **`entities/assignment`**
  - Типы:
    - `RoleAssignment`, `UserPermission`, `UserRole` (расширяет `Role`).
  - Сервис:
    - `getUserRoles/assignRole/revokeRole`,
    - `getUserPermissions/grantPermission/revokePermission`.

- **`entities/workspace`**
  - Типы:
    - `Workspace`, `WorkspaceModule`, `Member` (с `systemRole`).
  - Сервис:
    - `getWorkspaceMembers(workspaceId)` для страницы участников.

### 3. Авторизация и эффективные права

- **Тип `EffectivePermissions` (`features/auth/types/auth.ts`):**
  - `permissions: PermissionString[]` — все права (роль+индивидуальные),
  - `roles: string[]`,
  - `systemRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST'`.

- **`authService` и `authStore`:**
  - `authService.getEffectivePermissions(workspaceId)` ходит на `ME.PERMISSIONS`.
  - `authStore`:
    - `effectivePermissions: EffectivePermissions | null`,
    - `initAuth()`:
      - `/auth/me` → `userStore.fetchCurrentUser()`,
      - при успехе — `loadEffectivePermissions()` для текущего воркспейса,
    - `logout()` и обработка `401` очищают `effectivePermissions`.

- **Интеграция с выбором воркспейса (`workspace-store`):**
  - `switchWorkspace(workspaceId)`:
    - переключает воркспейс,
    - ставит заголовок `X-Workspace-ID`,
    - вызывает `authStore.loadEffectivePermissions()` для нового воркспейса.

Итого: фронт всегда опирается на один источник прав — `/me/permissions` в контексте активного воркспейса.

### 4. Каталог прав и дерево PermissionTree

- **`use-permission-tree` (`features/permissions/model/use-permission-tree.ts`):**
  - Берёт `workspaceId` из `useWorkspaceStore`.
  - Загружает `Permission[]` через `permissionService.getCatalog`.
  - Строит `PermissionTree` без хардкода:
    - группировка по `moduleCode` и `entityType`,
    - имя действия — `permission.name`,
    - `permissionString = \`\${moduleCode}:\${entityType}:\${action}\``.

- **`PermissionTree.vue` (`features/permissions/ui/PermissionTree.vue`):**
  - Принимает `modelValue: string[]` (строковые права).
  - Рисует дерево “модуль → сущность → действие”.
  - Эмитит `update:modelValue` c новым набором строковых прав при изменении чекбоксов.

Это реализует раздел 4 спецификации: динамическая группировка прав на фронте без жёстких словарей.

### 5. Проверка прав и защитник UI

- **`use-permissions` (`features/permissions/model/use-permissions.ts`):**
  - Читает `effectivePermissions` из `authStore`.
  - Строит `permissionList: PermissionString[]` и предоставляет:
    - `can(permission: PermissionString)`,
    - `canAny(permissions: PermissionString[])`,
    - `canAll(permissions: PermissionString[])`,
    - а также `permissions`, `roles`, `systemRole` как `computed`.

- **`PermissionGuard.vue` (`features/permissions/ui/PermissionGuard.vue`):**
  - API:
    - `permission: string | string[]`,
    - `requireAll?: boolean`,
    - `fallback?: Component`.
  - Внутри использует `usePermissions` и решает, рендерить слот или `fallback`.

### 6. Конфиги прав и best practice вместо “магических” строк

- **`features/permissions/config.ts`:**
  - Определён конфиг для CRM:

  ```5:9:frontend/src/features/permissions/config.ts
  import type { PermissionString } from '@/entities/role'

  export const CRM_PERMISSIONS = {
    contactCreate: 'crm:contact:create' as PermissionString,
    companyCreate: 'crm:company:create' as PermissionString,
    dealCreate: 'crm:deal:create' as PermissionString,
  } as const
  ```

  - Все проверки в UI используют именно эти константы, а не строки:
    - `ContactsToolbar` → `:permission="CRM_PERMISSIONS.contactCreate"`,
    - `CompaniesToolbar` → `:permission="CRM_PERMISSIONS.companyCreate"`,
    - `DealsToolbar` → `:permission="CRM_PERMISSIONS.dealCreate"`.

Добавление нового права в UI = добавить одну строку в конфиг, не трогая хук/guard.

### 7. Управление ролями (Workspace Roles)

- **Фича `features/roles`:**
  - `use-roles-page`:
    - грузит список ролей (через `roleService.list`),
    - вычисляет `systemRoles` и `customRoles`,
    - предоставляет `createRole/updateRole/deleteRole`.
  - `use-role-editor`:
    - управляет полями роли, включая список прав (`PermissionString[]`),
    - умеет и создавать, и редактировать.
  - `RoleFormModal.vue`:
    - модалка создания/редактирования роли,
    - использует `PermissionTree` для выбора прав.
  - `RolesList.vue`:
    - показывает:
      - системные роли (read-only),
      - кастомные роли (редактирование/удаление),
    - при редактировании загружает права роли через `roleService.getPermissions`.
    - показывает лоадер **только пока нет ролей и идёт первый запрос** (флаг `isLoading && !roles.length`).

- **Страница `/workspace-settings/roles`:**
  - `WorkspaceRolesPage` — обёртка над `RolesList` в карточке настроек.
  - Роут:
    - `path: '/workspace-settings/roles'`,
    - `beforeEnter: requireOwnerOrAdmin()`.
  - В `WorkspaceSettingsPage`:
    - блок “Права доступа” содержит ссылку  
      “Перейти к управлению ролями →” на `/workspace-settings/roles`.

### 8. Управление участниками и индивидуальными правами

- **Фича `features/members`:**
  - `use-member-roles(userId)`:
    - грузит все роли воркспейса,
    - грузит роли и индивидуальные права пользователя,
    - даёт `assignRole/revokeRole` и `grantPermission/revokePermission`.
  - `MemberRoleChips.vue`:
    - показывает кастомные роли пользователя как чипы,
    - умеет назначать новые кастомные роли и снимать существующие.

- **Фича `features/user-permissions`:**
  - `use-user-permissions(userId)`:
    - грузит каталог прав и индивидуальные права пользователя,
    - вычисляет `availablePermissions`,
    - даёт `grantPermission/revokePermission`.
  - `UserPermissionsPanel.vue`:
    - селект для выдачи прав и список выданных прав с кнопкой “Отозвать”.

- **Страница `/settings/members`:**
  - Загружается список участников воркспейса через `workspaceService.getWorkspaceMembers`.
  - Для каждого участника:
    - базовые данные + системная роль,
    - `MemberRoleChips` (кастомные роли),
    - `UserPermissionsPanel` (индивидуальные права).
  - Роут: `path: '/settings/members'`, `meta.requiresAuth = true`.

### 9. Интеграция прав в CRM-UI

- **Защита кнопок создания сущностей:**
  - Контакты:
    - `features/contacts/ui/ContactsToolbar.vue`:
      - кнопка “Создать контакт” обёрнута в `PermissionGuard :permission="CRM_PERMISSIONS.contactCreate"`.
  - Компании:
    - `features/companies/ui/CompaniesToolbar.vue`:
      - кнопка “Создать компанию” обёрнута в `PermissionGuard :permission="CRM_PERMISSIONS.companyCreate"`.
  - Сделки:
    - `features/deals/ui/DealsToolbar.vue`:
      - кнопка “Создать сделку” обёрнута в `PermissionGuard :permission="CRM_PERMISSIONS.dealCreate"`.

Эта защита уже использует конфиг прав и общий `PermissionGuard`.

### 10. Остаток плана (что можно делать дальше)

- **Спринт 2:**
  - Тесты и дополнительные сценарии для `PermissionTree` (поиск, UX‑улучшения).
- **Спринт 3:**
  - Наследование ролей (`use-role-inheritance`, `InheritanceTree.vue`) и визуализация дерева прав ролей.
  - При необходимости — вытянуть описания системных ролей в отдельный источник.
- **Спринт 4:**
  - Усилить UX `/settings/members` (поиск, фильтры, подтверждения).
- **Спринт 5:**
  - Продолжить интеграцию `PermissionGuard`/`use-permissions` в остальные модули (Habits, Projects).
  - Добавить devtools для отладки прав (просмотр `EffectivePermissions` в UI).
