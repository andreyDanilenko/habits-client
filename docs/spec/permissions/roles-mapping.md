# Спецификация: объединение ролей и прав на фронтенде

## 1. Формат данных API

### 1.1 Каталог прав (Catalog)

**Endpoint:** `GET /workspaces/:workspaceId/permissions/catalog`

**Ответ:**

```json
{
  "status": "success",
  "data": {
    "catalog": [
      {
        "id": "uuid",
        "moduleCode": "crm",
        "entityType": "deal",
        "action": "create",
        "name": "Создание сделки",
        "isSystem": true,
        "createdAt": "2026-03-06T12:06:02Z"
      }
    ],
    "modules": {
      "crm": {
        "deal": [
          /* массив Permission */
        ],
        "contact": [
          /* ... */
        ]
      }
    }
  }
}
```

- **catalog** — плоский массив всех доступных прав в workspace.
- **modules** — та же структура, сгруппированная по `moduleCode` → `entityType` для UI.

### 1.2 Права роли (Role Permissions)

**Endpoint:** `GET /workspaces/:workspaceId/roles/:roleId/permissions`

**Ответ:**

```json
{
  "status": "success",
  "data": {
    "permissions": ["crm:deal:create", "crm:deal:read", "crm:contact:create"]
  }
}
```

- **permissions** — массив строк в формате `moduleCode:entityType:action`.

### 1.3 Список ролей (Roles List)

**Endpoint:** `GET /workspaces/:workspaceId/roles`

**Ответ:**

```json
{
  "status": "success",
  "data": {
    "roles": [
      {
        "id": "uuid",
        "workspaceId": "uuid",
        "name": "Менеджер",
        "description": "...",
        "isSystem": false,
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
}
```

Роли **не содержат** поле `permissions` — права загружаются отдельным запросом.

---

## 2. PermissionString — единый формат

**Определение:** `PermissionString = \`${string}:${string}:${string}\``

**Примеры:** `crm:deal:create`, `habits:habit:read`, `workspace:role:manage`

**Связь с каталогом:**

```
Permission { moduleCode, entityType, action }  →  permissionString = `${moduleCode}:${entityType}:${action}`
```

---

## 3. Как объединять данные на фронтенде

### 3.1 Каталог + права роли → PermissionTree

1. **Каталог** — источник структуры дерева (модули → сущности → действия).
2. **Права роли** — массив `PermissionString[]`, который отмечает выбранные права.
3. **PermissionTree** строит дерево из каталога и проверяет `modelValueSet.has(permissionString)` для каждого действия.

```
Catalog (Permission[])     →  usePermissionTree  →  tree.modules[module].entities[entity].actions[action]
                                                         ↓
                                                    permissionString = "module:entity:action"
                                                         ↓
Role permissions (string[]) →  modelValue (PermissionString[])  →  modelValueSet.has(permissionString)
```

### 3.2 Список ролей + права при редактировании

| Шаг | Действие                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------- |
| 1   | Загрузить роли: `roleService.list(workspaceId)` → `Role[]`                                           |
| 2   | При клике «Редактировать»: `roleService.getPermissions(workspaceId, role.id)` → `PermissionString[]` |
| 3   | Передать `initialPermissions` в `RoleFormModal`                                                      |
| 4   | `PermissionTree` получает каталог из `usePermissionTree()` и `modelValue` из `permissions`           |

### 3.3 Дубликаты в массиве permissions

Если API возвращает дубликаты (например, при наследовании ролей или для ADMIN), на фронте нужно дедуплицировать:

```ts
const uniquePermissions = [...new Set(permissions)]
```

---

## 4. Контракт roleService.getPermissions

**Текущий контракт:** API возвращает `{ permissions: PermissionString[] }`, а тип `RolePermissionsResponse = PermissionString[]` ожидает массив.

**Корректная реализация:** сервис должен возвращать массив, извлекая его из ответа:

```ts
getPermissions: async (workspaceId: string, roleId: string): Promise<PermissionString[]> => {
  const response = await api.get<{ permissions: PermissionString[] }>(
    API_ENDPOINTS.ROLES.PERMISSIONS(workspaceId, roleId),
  )
  const raw = response?.permissions ?? []
  return [...new Set(raw)] as PermissionString[] // дедупликация
}
```

---

## 5. Схема потока данных (RolesList + RoleFormModal)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ RolesList                                                                │
│  • fetchRoles() → roleService.list() → roles[]                           │
│  • onEdit(role) → roleService.getPermissions(wsId, role.id) → perms[]   │
│  • editingRole = role, editingPermissions = perms                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ RoleFormModal                                                            │
│  • props: role, initialPermissions (PermissionString[])                  │
│  • useRoleEditor({ role, initialPermissions })                          │
│  • PermissionTree :model-value="permissions" @update:model-value="..."  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ PermissionTree                                                           │
│  • usePermissionTree() → tree (из catalog)                               │
│  • modelValue = permissions (PermissionString[])                        │
│  • Для каждого action: checked = modelValueSet.has(permissionString)    │
│  • permissionString = `${moduleCode}:${entityType}:${action}`            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Резюме

| Источник         | Формат                                                              | Назначение                                  |
| ---------------- | ------------------------------------------------------------------- | ------------------------------------------- |
| Catalog          | `Permission[]` с `id`, `moduleCode`, `entityType`, `action`, `name` | Структура дерева, человекочитаемые названия |
| Role permissions | `PermissionString[]` (`"module:entity:action"`)                     | Выбранные права роли                        |
| Связь            | `perm.moduleCode + ":" + perm.entityType + ":" + perm.action`       | Сопоставление каталога и прав роли          |

**Правило:** Каталог задаёт «что можно выбрать», права роли — «что выбрано». Оба используют один и тот же строковый идентификатор `PermissionString`.

---

## 7. Связанные документы

- [docs/MEMBERS/EXPLAIN_PERMISSIONS_HIERARCHY.md](../../../../docs/MEMBERS/EXPLAIN_PERMISSIONS_HIERARCHY.md) — иерархия системной роли, кастомных ролей и индивидуальных прав
