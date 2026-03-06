Отлично! Теперь у меня есть полная картина вашего фронтенда. Давайте создадим **финальную спецификацию системы прав**, которая идеально впишется в вашу существующую архитектуру.

---

# 📋 **СПЕЦИФИКАЦИЯ: СИСТЕМА УПРАВЛЕНИЯ РОЛЯМИ И ПРАВАМИ**

**Версия:** 5.0 (интеграционная)  
**Архитектура:** Feature-Sliced Design (Vue 3 + Pinia + Vue Router)  
**Дата:** Март 2026

---

## 1. 🏗 **ИНТЕГРАЦИЯ В СУЩЕСТВУЮЩУЮ АРХИТЕКТУРУ**

### 1.1. Новые сущности в `entities/`

```
entities/
├── permission/                    # НОВАЯ СУЩНОСТЬ
│   ├── types/
│   │   └── index.ts              # Типы Permission, PermissionCatalog
│   ├── api/
│   │   └── permission-service.ts # GET /permissions/catalog
│   └── index.ts
│
├── role/                          # НОВАЯ СУЩНОСТЬ
│   ├── types/
│   │   └── index.ts              # Типы Role, RolePermissions
│   ├── api/
│   │   └── role-service.ts       # CRUD /roles, /roles/:id/permissions, /roles/:id/inherit
│   └── index.ts
│
├── assignment/                    # НОВАЯ СУЩНОСТЬ
│   ├── types/
│   │   └── index.ts              # Типы RoleAssignment, UserPermission
│   ├── api/
│   │   └── assignment-service.ts # /users/:userId/roles, /users/:userId/permissions
│   └── index.ts
│
└── workspace/                     # СУЩЕСТВУЕТ, ДОПОЛНИТЬ
    └── types/
        └── index.ts              # Добавить Member (с системной ролью)
```

### 1.2. Новые фичи в `features/`

```
features/
├── roles/                         # Управление ролями
│   ├── model/
│   │   ├── use-roles-page.ts     # Список ролей
│   │   ├── use-role-editor.ts    # Создание/редактирование
│   │   └── use-role-inheritance.ts # Наследование
│   ├── ui/
│   │   ├── RolesList.vue
│   │   ├── RoleCard.vue
│   │   ├── RoleFormModal.vue
│   │   └── InheritanceTree.vue
│   └── index.ts
│
├── members/                        # Управление участниками (существует, ДОПОЛНИТЬ)
│   ├── model/
│   │   └── use-member-roles.ts    # НОВЫЙ: получение/назначение ролей
│   └── ui/
│       └── MemberRoleChips.vue     # НОВЫЙ: отображение ролей пользователя
│
├── permissions/                    # Права (новая фича)
│   ├── model/
│   │   ├── use-permission-tree.ts  # Группировка прав
│   │   └── use-permissions.ts      # Проверка прав
│   ├── ui/
│   │   ├── PermissionTree.vue      # Дерево прав (для редактора ролей)
│   │   └── PermissionGuard.vue     # Компонент-защитник
│   └── index.ts
│
└── user-permissions/               # Индивидуальные права
    ├── model/
    │   └── use-user-permissions.ts
    ├── ui/
    │   └── UserPermissionsPanel.vue
    └── index.ts
```

### 1.3. Новые страницы в `pages/`

```
pages/
├── settings/                       # Существует
│   └── members/                    # Существует (дополнить отображением ролей)
│
└── workspace-settings/              # Существует
    ├── roles/                       # НОВЫЙ: /workspace-settings/roles
    │   ├── index.ts
    │   └── WorkspaceRolesPage.vue   # Список ролей + кнопка создания
    │
    └── role-detail/                  # НОВЫЙ: /workspace-settings/roles/:id
        ├── index.ts
        └── RoleDetailPage.vue        # Редактирование конкретной роли
```

---

## 2. 📊 **МОДЕЛЬ ДАННЫХ (СОГЛАСОВАННАЯ С БЭКОМ)**

### 2.1. Контракты (TypeScript)

```typescript
// ==================== entities/permission/types/index.ts ====================

// Право из каталога (соответствует таблице permission_catalog)
export interface Permission {
  id: string // UUID
  moduleCode: string // "crm" | "habits" | "projects" | "workspace"
  entityType: string // "deal" | "contact" | "habit" | "member" | "role"
  action: string // "create" | "read" | "update" | "delete" | "manage"
  name: string // "Создание сделки" (для UI, приходит с бэка!)
  isSystem: boolean // системные права нельзя удалить
  createdAt: string
}

// Ответ от GET /permissions/catalog
export type PermissionsCatalogResponse = Permission[]

// Дерево прав для UI (группируем на фронте)
export interface PermissionTree {
  modules: Record<
    string,
    {
      code: string
      name: string // Из первого permission или отдельного эндпоинта
      entities: Record<
        string,
        {
          code: string
          name: string // Из первого permission или отдельного эндпоинта
          actions: Record<
            string,
            {
              code: string
              name: string // Из permission.name
              permission: Permission
              permissionString: string
            }
          >
        }
      >
    }
  >
  flat: Permission[] // оригинальный список для поиска
}

// ==================== entities/role/types/index.ts ====================

// Роль в workspace (соответствует workspace_roles)
export interface Role {
  id: string
  workspaceId: string
  name: string // "Менеджер по продажам"
  description: string | null
  isSystem: boolean // true для OWNER/ADMIN/MEMBER/GUEST
  createdAt: string
  updatedAt: string
}

// Права роли (строковый формат)
export type PermissionString = `${string}:${string}:${string}` // "crm:deal:create"

// Ответ от GET /roles/{roleId}/permissions
export type RolePermissionsResponse = PermissionString[]

// ==================== entities/assignment/types/index.ts ====================

// Назначение роли (user_role_assignments)
export interface RoleAssignment {
  userId: string
  roleId: string
  workspaceId: string
  assignedBy?: string
  assignedAt: string
}

// Индивидуальное право (user_permissions)
export interface UserPermission {
  id: string
  userId: string
  workspaceId: string
  permissionId: string
  permission: PermissionString
  moduleCode: string
  entityType: string
  action: string
  grantedBy?: string
  grantedAt: string
  expiresAt?: string | null
}

// Ответ от GET /users/{userId}/roles (расширенный)
export interface UserRole extends Role {
  assignedAt: string
  assignedBy?: string
}

// ==================== entities/workspace/types/index.ts (дополнение) ====================

// Участник workspace (из /members)
export interface Member {
  id: string
  email: string
  name: string
  systemRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST' // системная роль
  joinedAt: string
}

// ==================== features/auth/types.ts (дополнение) ====================

// Эффективные права текущего пользователя (из /me/permissions)
export interface EffectivePermissions {
  permissions: PermissionString[] // все права (роли + индивидуальные)
  roles: string[] // имена ролей
  systemRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST'
}

// ==================== Для UI (объединенные типы) ====================

// Пользователь с ролями (для страницы members)
export interface UserWithRoles extends Member {
  customRoles: UserRole[] // назначенные кастомные роли
  individualPermissions: UserPermission[]
}
```

---

## 3. 🌐 **API ЭНДПОИНТЫ (ПОЛНЫЙ СПИСОК)**

### 3.1. Базовый URL (уже есть в `API_ENDPOINTS`)

```typescript
// shared/api/endpoints.ts - ДОБАВИТЬ:

export const API_ENDPOINTS = {
  // ... существующие ...

  // НОВЫЕ СЕКЦИИ
  PERMISSIONS: {
    CATALOG: (workspaceId: string) => `${API_V1}/workspaces/${workspaceId}/permissions/catalog`,
  },

  ROLES: {
    LIST: (workspaceId: string) => `${API_V1}/workspaces/${workspaceId}/roles`,
    DETAIL: (workspaceId: string, roleId: string) =>
      `${API_V1}/workspaces/${workspaceId}/roles/${roleId}`,
    PERMISSIONS: (workspaceId: string, roleId: string) =>
      `${API_V1}/workspaces/${workspaceId}/roles/${roleId}/permissions`,
    INHERIT: (workspaceId: string, roleId: string, parentRoleId: string) =>
      `${API_V1}/workspaces/${workspaceId}/roles/${roleId}/inherit/${parentRoleId}`,
  },

  ASSIGNMENTS: {
    USER_ROLES: (workspaceId: string, userId: string) =>
      `${API_V1}/workspaces/${workspaceId}/users/${userId}/roles`,
    USER_ROLE: (workspaceId: string, userId: string, roleId: string) =>
      `${API_V1}/workspaces/${workspaceId}/users/${userId}/roles/${roleId}`,
    USER_PERMISSIONS: (workspaceId: string, userId: string) =>
      `${API_V1}/workspaces/${workspaceId}/users/${userId}/permissions`,
    USER_PERMISSION: (workspaceId: string, userId: string, permissionId: string) =>
      `${API_V1}/workspaces/${workspaceId}/users/${userId}/permissions/${permissionId}`,
  },

  ME: {
    PERMISSIONS: (workspaceId: string) => `${API_V1}/me/permissions?workspaceId=${workspaceId}`,
  },
}
```

### 3.2. Полная спецификация эндпоинтов

```typescript
// ==================== PERMISSIONS ====================

// GET /permissions/catalog
// Response: Permission[]
// Описание: Получить каталог всех прав в системе

// ==================== ROLES ====================

// GET /roles
// Response: Role[]
// Описание: Список всех ролей workspace (системные + кастомные)

// GET /roles/{roleId}
// Response: Role
// Описание: Детальная информация о роли

// GET /roles/{roleId}/permissions
// Response: PermissionString[]
// Описание: Права конкретной роли

// POST /roles
// Request: { name: string; description?: string; permissions: PermissionString[] }
// Response: Role
// Описание: Создать новую кастомную роль

// PUT /roles/{roleId}
// Request: { name?: string; description?: string; permissions: PermissionString[] }
// Response: Role
// Описание: Обновить роль (только кастомную)

// DELETE /roles/{roleId}
// Response: 204
// Описание: Удалить роль (только кастомную, без назначений)

// POST /roles/{roleId}/inherit/{parentRoleId}
// Response: 201
// Описание: Добавить наследование (роль наследует права другой роли)

// DELETE /roles/{roleId}/inherit/{parentRoleId}
// Response: 204
// Описание: Удалить наследование

// ==================== ASSIGNMENTS ====================

// GET /users/{userId}/roles
// Response: UserRole[]
// Описание: Роли конкретного пользователя в workspace

// POST /users/{userId}/roles/{roleId}
// Response: 201
// Описание: Назначить роль пользователю

// DELETE /users/{userId}/roles/{roleId}
// Response: 204
// Описание: Снять роль с пользователя

// GET /users/{userId}/permissions
// Response: UserPermission[]
// Описание: Индивидуальные права пользователя

// POST /users/{userId}/permissions
// Request: { permissionId: string; expiresAt?: string }
// Response: 201
// Описание: Выдать индивидуальное право

// DELETE /users/{userId}/permissions/{permissionId}
// Response: 204
// Описание: Отозвать индивидуальное право

// ==================== ME ====================

// GET /me/permissions?workspaceId={workspaceId}
// Response: { permissions: PermissionString[]; roles: string[]; systemRole: string }
// Описание: Права текущего пользователя в указанном workspace

// ==================== WORKSPACE (дополнение) ====================

// GET /members
// Response: Member[]
// Описание: Список участников workspace (уже есть, но добавить типизацию)
```

---

## 4. 🎯 **ДИНАМИЧЕСКАЯ ГРУППИРОВКА ПРАВ**

### 4.1. Проблема и решение

**Проблема:** В каталоге прав (`Permission`) нет поля `moduleName` или `entityName`. Есть только:

- `moduleCode` ("crm")
- `entityType` ("deal")
- `name` ("Создание сделки")

Но для UI нужно:

- Название модуля ("CRM")
- Название сущности ("Сделки")

**Решение:** Три варианта, выбираем по договоренности с бэком:

| Вариант                             | Описание                                                | Плюсы                 | Минусы                                          |
| ----------------------------------- | ------------------------------------------------------- | --------------------- | ----------------------------------------------- |
| **А: Делаем на фронте**             | Хардкодим словари `moduleNames`, `entityNames`          | Просто, быстро        | Негибко, новый модуль требует обновления фронта |
| **Б: Бэкенд возвращает метаданные** | `GET /modules/metadata`                                 | Гибко, консистентно   | Дополнительный запрос                           |
| **В: Бэкенд группирует**            | `GET /permissions/catalog/grouped` с готовой структурой | Идеально, один запрос | Требует доработки бэка                          |

**Рекомендация:** **Вариант В** - просим бэкенд вернуть готовую структуру.

### 4.2. Идеальный контракт (если бэкенд согласится)

```typescript
// GET /permissions/catalog/grouped
// Response:
interface GroupedPermissionsResponse {
  modules: Array<{
    code: string // "crm"
    name: string // "CRM"
    entities: Array<{
      code: string // "deal"
      name: string // "Сделки"
      actions: Array<{
        code: string // "create"
        name: string // "Создание сделки"
        permission: Permission
        permissionString: string
      }>
    }>
  }>
  flat: Permission[]
}
```

### 4.3. Если бэкенд НЕ меняет API - делаем на фронте

Создаем **entity/permission/lib/normalize.ts**:

```typescript
// Временное решение, пока бэкенд не отдаёт готовую структуру
export const normalizePermissions = (permissions: Permission[]): PermissionTree => {
  const modules: PermissionTree['modules'] = {}

  // ВРЕМЕННЫЙ ХАРДКОД - нужно будет убрать, когда бэкенд начнёт отдавать названия
  const moduleNames: Record<string, string> = {
    crm: 'CRM',
    habits: 'Привычки',
    projects: 'Проекты',
    workspace: 'Управление',
  }

  const entityNames: Record<string, string> = {
    deal: 'Сделки',
    contact: 'Контакты',
    company: 'Компании',
    habit: 'Привычки',
    journal: 'Дневник',
    member: 'Участники',
    role: 'Роли',
    module: 'Модули',
  }

  permissions.forEach((perm) => {
    // ... группировка с использованием moduleNames и entityNames
  })

  return { modules, flat: permissions }
}
```

**Важно:** Этот код нужно будет удалить, как только бэкенд начнёт отдавать структуру.

---

## 5. 🔄 **ОРГАНИЗАЦИЯ ОБМЕНА С СЕРВЕРОМ**

### 5.1. Слои доступа к данным

```
┌─────────────────────────────────────────────────────────────┐
│                      Vue Components                          │
│              (pages/*, widgets/*, features/*/ui)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Composables (features/*/model)             │
│  • useRolesPage()         • useRoleEditor()                 │
│  • useMemberRoles()       • useUserPermissions()            │
│  • usePermissionTree()    • usePermissions()                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Domain Services                         │
│  (entities/*/api/*-service.ts)                              │
│  • permissionService.getCatalog()                           │
│  • roleService.list(), create(), update(), delete()         │
│  • assignmentService.getUserRoles(), assignRole(), etc      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Api Client                           │
│  (shared/api/client.ts + endpoints.ts)                      │
│  • Автоматически добавляет X-Workspace-ID                   │
│  • Обрабатывает 401 (редирект на login)                     │
│  • Поддерживает моки (VITE_USE_MOCK_API)                    │
└─────────────────────────────────────────────────────────────┘
```

### 5.2. Стратегия кэширования

| Данные                 | TTL   | Инвалидация                        | Где хранить       |
| ---------------------- | ----- | ---------------------------------- | ----------------- |
| `/me/permissions`      | 5 мин | При смене workspace, после мутаций | `authStore`       |
| `/permissions/catalog` | 1 час | Никогда (редко меняется)           | `permissionStore` |
| `/roles`               | 5 мин | После create/update/delete         | `roleStore`       |
| `/users/{id}/roles`    | 5 мин | После assign/unassign              | `memberStore`     |

### 5.3. Pinia Store структура

```typescript
// stores/permission.ts
interface PermissionState {
  catalog: PermissionTree | null
  isLoading: boolean
  error: string | null
}

// stores/role.ts
interface RoleState {
  roles: Role[]
  currentRole: Role | null
  rolePermissions: Record<string, PermissionString[]>
  isLoading: boolean
  error: string | null
}

// stores/member.ts (дополнить)
interface MemberState {
  members: Member[]
  userRoles: Record<string, UserRole[]>
  userPermissions: Record<string, UserPermission[]>
}
```

---

## 6. 🏛 **UI КОМПОНЕНТЫ (СПЕЦИФИКАЦИЯ)**

### 6.1. Страница списка ролей (`/workspace-settings/roles`)

```
┌─────────────────────────────────────────────────┐
│  Роли workspace                          [＋]   │ ← кнопка создания
├─────────────────────────────────────────────────┤
│                                                  │
│  СИСТЕМНЫЕ РОЛИ (нередактируемые)               │
│  ┌─────────────────────────────────────────┐   │
│  │ OWNER  • Владелец workspace            │   │
│  │ ADMIN  • Администратор                 │   │
│  │ MEMBER • Сотрудник                     │   │
│  │ GUEST  • Гость                         │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  КАСТОМНЫЕ РОЛИ                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ Менеджер по продажам                ✎ 🗑 │   │
│  │ Продажи, контакты                        │   │
│  ├─────────────────────────────────────────┤   │
│  │ Старший менеджер                     ✎ 🗑 │   │
│  │ Наследует: Менеджер по продажам          │   │
│  │ + удаление сделок                        │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 6.2. Редактор роли (модальное окно)

```
┌─────────────────────────────────────────────────┐
│  Создание роли                              [✕] │
├─────────────────────────────────────────────────┤
│  Название: [ Менеджер по продажам    ]          │
│  Описание: [ Работа со сделками и контактами ]  │
│                                                  │
│  Наследование: [ Менеджер по продажам ▼ ]       │ ← select с ролями
│                                                  │
│  Права:                                           │
│  ┌─────────────────────────────────────────┐   │
│  │ CRM                                    ▼ │   │
│  │  ┌─────────────────────────────────┐   │   │
│  │  │ Сделки                          ▼ │   │   │
│  │  │  ☑ Создание сделки                │   │   │
│  │  │  ☑ Просмотр сделки                │   │   │
│  │  │  ☐ Редактирование сделки          │   │   │ ← чекбоксы
│  │  │  ☐ Удаление сделки                │   │   │
│  │  └─────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────┐   │   │
│  │  │ Контакты                        ▼ │   │   │
│  │  │  ☑ Создание контакта              │   │   │
│  │  │  ☑ Просмотр контакта              │   │   │
│  │  │  ☐ Редактирование контакта        │   │   │
│  │  └─────────────────────────────────┘   │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│                          [ Отмена ] [ Сохранить ]│
└─────────────────────────────────────────────────┘
```

### 6.3. Карточка пользователя (в `/settings/members`)

```
┌─────────────────────────────────────────────────┐
│  Иванов Иван                            [⚙]    │ ← меню действий
│  ivan@company.com                               │
│  Системная роль: MEMBER                          │
│                                                  │
│  Кастомные роли:                                 │
│    [ Менеджер по продажам ]  [x]                │ ← можно удалить
│    [ Старший менеджер      ]  [x]                │
│    [＋ Добавить роль]                           │ ← открывает список
│                                                  │
│  Индивидуальные права:                           │
│    [⌄] 2 дополнительных права                    │ ← аккордеон
│    • Удаление сделок (до 31.12.2024)            │
│    • Экспорт сделок                              │
│    [＋ Выдать право]                             │
└─────────────────────────────────────────────────┘
```

### 6.4. Компонент-защитник (для скрытия UI)

```vue
<!-- features/permissions/ui/PermissionGuard.vue -->
<template>
  <slot v-if="hasPermission" />
  <component :is="fallback" v-else-if="fallback" />
  <template v-else>
    <!-- ничего не показываем -->
  </template>
</template>

<script setup lang="ts">
  import { usePermissions } from '../model/usePermissions'

  const props = defineProps<{
    permission: PermissionString | PermissionString[]
    requireAll?: boolean // true = нужны все права, false = хотя бы одно
    fallback?: Component
  }>()

  const { hasPermission } = usePermissions()
</script>
```

### 6.5. Хук для проверки прав

```typescript
// features/permissions/model/usePermissions.ts
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/features/auth'

export const usePermissions = () => {
  const authStore = useAuthStore()
  const { effectivePermissions } = storeToRefs(authStore)

  const can = (permission: PermissionString): boolean => {
    return effectivePermissions.value?.permissions.includes(permission) ?? false
  }

  const canAny = (permissions: PermissionString[]): boolean => {
    return permissions.some(can)
  }

  const canAll = (permissions: PermissionString[]): boolean => {
    return permissions.every(can)
  }

  return {
    can,
    canAny,
    canAll,
    permissions: effectivePermissions.value?.permissions ?? [],
    roles: effectivePermissions.value?.roles ?? [],
    systemRole: effectivePermissions.value?.systemRole,
  }
}
```

---

## 7. 📦 **ПЛАН ВНЕДРЕНИЯ (5 СПРИНТОВ)**

### **Спринт 1: Базовая инфраструктура (2 дня)**

- [ ] Добавить эндпоинты в `shared/api/endpoints.ts`
- [ ] Создать сервисы в `entities/permission`, `entities/role`, `entities/assignment`
- [ ] Дополнить `authStore` полем `effectivePermissions`
- [ ] Добавить вызов `/me/permissions` в `initAuth()`

### **Спринт 2: Каталог прав и группировка (3 дня)**

- [ ] Согласовать с бэком формат каталога (Вариант В)
- [ ] Реализовать `features/permissions/model/usePermissionTree.ts`
- [ ] Создать компонент `PermissionTree.vue`
- [ ] Добавить тесты на группировку

### **Спринт 3: Управление ролями (3 дня)**

- [ ] Страница `/workspace-settings/roles` со списком
- [ ] Модалка создания/редактирования роли
- [ ] Интеграция `PermissionTree.vue` в редактор
- [ ] Удаление ролей (с подтверждением)

### **Спринт 4: Управление пользователями (3 дня)**

- [ ] Дополнить страницу `/settings/members` отображением ролей
- [ ] Компонент назначения ролей (MemberRoleChips.vue)
- [ ] Панель индивидуальных прав (UserPermissionsPanel.vue)
- [ ] Выдача/отзыв прав

### **Спринт 5: Интеграция в интерфейс (3 дня)**

- [ ] Компонент `PermissionGuard.vue`
- [ ] Хук `usePermissions()`
- [ ] Пройтись по всем модулям и защитить кнопки/действия
- [ ] Devtools для отладки прав

---

## 8. ✅ **ИТОГОВЫЙ ЧЕК-ЛИСТ**

### Данные (entities)

- [ ] `entities/permission` - типы, сервис, нормализация
- [ ] `entities/role` - типы, CRUD сервис
- [ ] `entities/assignment` - типы, сервис назначений

### Фичи (features)

- [ ] `features/roles` - управление ролями
- [ ] `features/members` - дополнение ролями пользователей
- [ ] `features/permissions` - дерево прав, проверки
- [ ] `features/user-permissions` - индивидуальные права

### Страницы (pages)

- [ ] `/workspace-settings/roles` - список ролей
- [ ] `/workspace-settings/roles/:id` - детальная роль
- [ ] `/settings/members` - дополнено ролями

### Интеграция

- [ ] `/me/permissions` загружается при старте
- [ ] Права обновляются при смене workspace
- [ ] Кэширование работает по стратегии
- [ ] Все кнопки в CRM защищены правами
- [ ] Все кнопки в Habits защищены правами
- [ ] Все кнопки в Projects защищены правами

---

**Статус документа:** Готов к реализации  
**Дата:** Март 2026  
**Версия:** 5.0 (интеграционная)
