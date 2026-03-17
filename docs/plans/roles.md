# ОБНОВЛЕННАЯ SPEC ERP: Завершение управления ролями и правами

## На основе текущей реализации (Отчёт PERMISSION_REPORT_CURRENT)

**Версия 5.0** | Март 2026

---

## Содержание

1. **Текущий статус реализации (что уже работает)**
2. **Что нужно для ПОЛНОГО завершения управления ролями**
3. **Детальный план работ**
4. **Согласование типов между бэкендом и фронтендом**
5. **Технические требования для завершения**

---

## 1. Текущий статус реализации (что уже работает)

### 1.1. Бэкенд (100% готово)

| Компонент                 | Статус | Описание                                     |
| ------------------------- | ------ | -------------------------------------------- |
| **База данных**           | ✅     | Все таблицы созданы, данные перенесены       |
| **permission_catalog**    | ✅     | Заполнен для всех модулей                    |
| **workspace_roles**       | ✅     | Системные и кастомные роли                   |
| **user_role_assignments** | ✅     | Назначения ролей пользователям               |
| **user_permissions**      | ✅     | Индивидуальные права                         |
| **role_inheritance**      | ✅     | Таблица для наследования                     |
| **Casbin**                | ✅     | Интегрирован, политики работают              |
| **Middleware**            | ✅     | Workspace, Module, Permission — всё работает |
| **API для ролей**         | ✅     | CRUD ролей, назначение, права                |
| **API для пользователей** | ✅     | Назначение ролей, индивидуальные права       |
| **API /me/permissions**   | ✅     | Возвращает права текущего пользователя       |
| **API наследования**      | ✅     | POST/DELETE /inherit готовы                  |

### 1.2. Фронтенд (что уже работает)

| Компонент                  | Статус | Описание                                              |
| -------------------------- | ------ | ----------------------------------------------------- |
| **Типы данных**            | ✅     | `Permission`, `Role`, `PermissionString` определены   |
| **API эндпоинты**          | ✅     | Централизованы в `shared/api/endpoints.ts`            |
| **authStore**              | ✅     | Загружает права через `/me/permissions`               |
| **usePermissions хук**     | ✅     | Методы `can()`, `canAny()`, `canAll()`                |
| **PermissionGuard**        | ✅     | Компонент для защиты UI                               |
| **PermissionTree**         | ✅     | Динамическое дерево прав из каталога                  |
| **Управление ролями**      | ✅     | `RolesList`, `RoleFormModal`, создание/редактирование |
| **Страница ролей**         | ✅     | `/workspace-settings/roles` с защитой                 |
| **Управление участниками** | ✅     | `/settings/members` с ролями и правами                |
| **MemberRoleChips**        | ✅     | Назначение ролей пользователям                        |
| **UserPermissionsPanel**   | ✅     | Выдача индивидуальных прав                            |
| **Интеграция в CRM**       | ✅     | Кнопки защищены через `PermissionGuard`               |
| **Конфиг прав для CRM**    | ✅     | `CRM_PERMISSIONS` в `config.ts`                       |

---

## 2. Что нужно для ПОЛНОГО завершения управления ролями

### 2.1. Критически важное (без этого функционал неполный)

> **Модель прав:** Кастомная роль **полностью перезаписывает** базовую системную. Если у пользователя есть хотя бы одна кастомная роль, используются только права кастомных ролей — системные (OWNER/ADMIN/MEMBER/GUEST) игнорируются. Реализовано в `GetEffectivePermissions` на бэкенде.

| Задача                        | Почему важно                             | Где используется                 |
| ----------------------------- | ---------------------------------------- | -------------------------------- |
| **Конфиги прав для Habits**   | Habits не защищён правами                | Модуль Habits                    |
| **Конфиги прав для Projects** | Projects не защищён правами              | Модуль Projects                  |
| **DevTools для отладки прав** | Сложно проверить, что видит пользователь | Разработка и поддержка           |

### 2.2. Важные улучшения (UX)

| Задача                        | Почему важно                                 | Где используется       |
| ----------------------------- | -------------------------------------------- | ---------------------- |
| **Поиск в дереве прав**       | У админов много прав, трудно ориентироваться | RoleFormModal          |
| **Поиск по участникам**       | В компании может быть 100+ сотрудников       | Members page           |
| **Фильтр по системным ролям** | Быстро найти всех GUEST или ADMIN            | Members page           |
| **Confirm модалки**           | Случайно не удалить роль/право               | Везде, где есть delete |

---

## 3. Детальный план работ

### Этап 1: Наследование ролей (опционально, низкий приоритет)

> **Примечание:** При текущей модели (кастомная роль перезаписывает системную) UI для наследования между кастомными ролями не критичен. API `addInheritance/removeInheritance` существует, но интерфейс можно отложить.

#### Что нужно сделать

1. **Добавить выбор родительской роли в форму**

```vue
<!-- В RoleFormModal.vue добавить -->
<template>
  <form>
    <!-- существующие поля -->
    <div class="form-group">
      <label>Наследование от роли</label>
      <select v-model="form.inherits">
        <option :value="null">Не наследует</option>
        <option v-for="role in availableParentRoles" :key="role.id" :value="role.id">
          {{ role.name }}
        </option>
      </select>
      <small>Роль унаследует все права выбранной роли</small>
    </div>
  </form>
</template>
```

2. **Показать унаследованные права в дереве**

```typescript
// В useRoleEditor добавить
const inheritedPermissions = computed(() => {
  if (!form.inherits) return []
  const parentRole = roles.value.find((r) => r.id === form.inherits)
  return parentRole?.permissions || []
})

// В PermissionTree передавать inheritedPermissions для серой подсветки
```

3. **API интеграция**

- При сохранении роли: если `inherits` выбран, вызвать `roleService.addInheritance`
- При загрузке роли: получить список родителей через `roleService.getInheritance`

### Этап 2: Конфиги прав для Habits и Projects (1 неделя)

#### 2.1. Habits

```typescript
// features/permissions/config.ts (дополнить)
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

**Где использовать:**

- `HabitsList.vue` — кнопка "Создать привычку" → `HABITS_PERMISSIONS.habitCreate`
- `HabitCard.vue` — кнопки "Редактировать"/"Удалить" → соответствующие права
- `JournalList.vue` — кнопка "Создать запись" → `HABITS_PERMISSIONS.journalCreate`

#### 2.2. Projects

```typescript
// features/permissions/config.ts (дополнить)
export const PROJECTS_PERMISSIONS = {
  projectCreate: 'projects:project:create' as PermissionString,
  projectRead: 'projects:project:read' as PermissionString,
  projectUpdate: 'projects:project:update' as PermissionString,
  projectDelete: 'projects:project:delete' as PermissionString,
  entityAttach: 'projects:entity:attach' as PermissionString,
  entityDetach: 'projects:entity:detach' as PermissionString,
} as const
```

**Где использовать:**

- `ProjectsList.vue` — кнопка "Создать проект" → `PROJECTS_PERMISSIONS.projectCreate`
- `ProjectCard.vue` — кнопки действий → соответствующие права
- `ProjectEntities.vue` — кнопки привязки/отвязки → соответствующие права

### Этап 3: Улучшения UX (1.5 недели)

#### 3.1. Поиск в дереве прав

```typescript
// features/permissions/model/use-permission-tree.ts
export function usePermissionTree(workspaceId: string) {
  const searchQuery = ref('')

  const filteredTree = computed(() => {
    if (!searchQuery.value) return tree.value

    return tree.value
      .filter((module) => {
        // Фильтруем модули, где есть сущности с подходящими правами
        const hasMatchingEntities = Object.entries(module.entities).some(([_, entity]) => {
          return entity.actions.some((action) =>
            action.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
          )
        })
        return hasMatchingEntities
      })
      .map((module) => ({
        ...module,
        entities: Object.fromEntries(
          Object.entries(module.entities)
            .filter(([_, entity]) => {
              return entity.actions.some((action) =>
                action.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
              )
            })
            .map(([key, entity]) => [
              key,
              {
                ...entity,
                actions: entity.actions.filter((action) =>
                  action.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
                ),
              },
            ]),
        ),
      }))
  })

  return { tree: filteredTree, searchQuery }
}
```

#### 3.2. Поиск и фильтры на странице участников

```typescript
// features/members/model/use-member-filters.ts
export function useMemberFilters(members: Ref<Member[]>) {
  const searchQuery = ref('')
  const roleFilter = ref<'all' | 'MEMBER' | 'GUEST' | 'ADMIN' | 'OWNER'>('all')

  const filteredMembers = computed(() => {
    return members.value.filter((member) => {
      // Поиск по имени/email
      const matchesSearch =
        !searchQuery.value ||
        member.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.value.toLowerCase())

      // Фильтр по системной роли
      const matchesRole = roleFilter.value === 'all' || member.systemRole === roleFilter.value

      return matchesSearch && matchesRole
    })
  })

  return { searchQuery, roleFilter, filteredMembers }
}
```

#### 3.3. Confirm модалки

```vue
<!-- shared/ui/ConfirmModal.vue -->
<template>
  <Modal v-model="show" :title="title">
    <p>{{ message }}</p>
    <template #footer>
      <Button variant="danger" @click="confirm">Удалить</Button>
      <Button variant="secondary" @click="cancel">Отмена</Button>
    </template>
  </Modal>
</template>
```

**Где использовать:**

- При удалении роли
- При снятии роли с пользователя
- При отзыве индивидуального права

### Этап 4: DevTools для отладки прав (0.5 недели)

```vue
<!-- features/devtools/PermissionDebugger.vue -->
<template>
  <div v-if="isDev" class="permission-debugger">
    <details>
      <summary>🔧 Права пользователя (debug)</summary>
      <div class="debug-content">
        <h4>Системная роль: {{ systemRole }}</h4>
        <h4>Кастомные роли:</h4>
        <ul>
          <li v-for="role in roles" :key="role">{{ role }}</li>
        </ul>
        <h4>Все права ({{ permissions.length }}):</h4>
        <div class="permissions-list">
          <span v-for="perm in permissions" :key="perm" class="permission-tag">
            {{ perm }}
          </span>
        </div>
        <h4>Проверка права:</h4>
        <div class="permission-check">
          <input v-model="testPermission" placeholder="crm:deal:create" />
          <button @click="test">Проверить</button>
          <span v-if="testResult === true" class="allowed">✅ Разрешено</span>
          <span v-else-if="testResult === false" class="denied">❌ Запрещено</span>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { usePermissions } from '@/features/permissions'

  const isDev = import.meta.env.DEV
  const { permissions, roles, systemRole, can } = usePermissions()

  const testPermission = ref('')
  const testResult = ref<boolean | null>(null)

  const test = () => {
    testResult.value = can(testPermission.value as any)
  }
</script>
```

**Интеграция:** Добавить компонент в `App.vue` или в шапку приложения в development режиме.

---

## 4. Согласование типов между бэкендом и фронтендом

### 4.1. Текущая ситуация

Сейчас на фронтенде есть ручной конфиг `CRM_PERMISSIONS`:

```typescript
export const CRM_PERMISSIONS = {
  contactCreate: 'crm:contact:create' as PermissionString,
  companyCreate: 'crm:company:create' as PermissionString,
  dealCreate: 'crm:deal:create' as PermissionString,
} as const
```

**Проблема:** При добавлении нового права на бэкенде, фронтенд узнает об этом только когда разработчик вручную добавит строку в конфиг.

### 4.2. Решение: Автоматическая генерация типов

#### 4.2.1. Бэкенд: скрипт генерации

```go
// backend/scripts/generate-permission-types.go
package main

import (
    "database/sql"
    "fmt"
    "os"
    "strings"
    "time"
)

func main() {
    db, _ := sql.Open("postgres", os.Getenv("DATABASE_URL"))
    defer db.Close()

    rows, _ := db.Query(`
        SELECT module_code, entity_type, action
        FROM permission_catalog
        ORDER BY module_code, entity_type, action
    `)
    defer rows.Close()

    var permissions []string
    for rows.Next() {
        var module, entity, action string
        rows.Scan(&module, &entity, &action)
        permissions = append(permissions, fmt.Sprintf("    | '%s:%s:%s'", module, entity, action))
    }

    output := fmt.Sprintf(`// generated/permission.types.ts
// Автоматически сгенерировано %s
// НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ

export type PermissionString =
%s;

export const ALL_PERMISSIONS: PermissionString[] = [
%s
];

export function isValidPermission(perm: string): perm is PermissionString {
    return ALL_PERMISSIONS.includes(perm as PermissionString);
}
`, time.Now().Format("2006-01-02"),
   strings.Join(permissions, "\n"),
   strings.Join(permissions, ",\n"))

    os.WriteFile("../frontend/src/generated/permission.types.ts", []byte(output), 0644)
}
```

#### 4.2.2. Интеграция в CI/CD

```yaml
# .github/workflows/generate-permissions.yml
name: Generate Permission Types
on:
  push:
    branches: [main]
    paths:
      - 'backend/migrations/*permissions*.sql'
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      - name: Generate types
        run: |
          cd backend
          go run scripts/generate-permission-types.go
      - name: Create PR
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: 'chore: update permission types'
          title: 'chore: update permission types'
          body: 'Автоматически сгенерировано из изменений в permission_catalog'
          branch: 'chore/update-permission-types'
          base: 'main'
```

#### 4.2.3. Фронтенд: использование сгенерированных типов

```typescript
// features/permissions/config.ts
import { PermissionString } from '@/generated/permission.types'

// Теперь тип PermissionString гарантированно соответствует бэкенду
export const CRM_PERMISSIONS = {
  contactCreate: 'crm:contact:create' as PermissionString,
  companyCreate: 'crm:company:create' as PermissionString,
  dealCreate: 'crm:deal:create' as PermissionString,
} as const

// TypeScript не даст добавить несуществующее право
// ❌ Ошибка: 'crm:deal:creat' не входит в PermissionString
```

#### 4.2.4. ESLint правило для защиты

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/^[a-z]+:[a-z]+:[a-z]+$/]',
        message: 'Используйте импортированные константы из config.ts вместо строк',
      },
    ],
  },
}
```

---

## 5. Технические требования для завершения

### 5.1. Критерии готовности наследования (опционально)

- [ ] В форме создания/редактирования роли есть выпадающий список "Наследует"
- [ ] Список показывает только кастомные роли (не системные)
- [ ] Нельзя выбрать роль, которая создаст цикл (например, А → Б → А)
- [ ] Унаследованные права отображаются серым цветом в дереве
- [ ] При сохранении вызывается API `addInheritance`
- [ ] При загрузке роли подтягиваются все родители

### 5.2. Критерии готовности конфигов

- [ ] `HABITS_PERMISSIONS` содержит все права для Habits
- [ ] `PROJECTS_PERMISSIONS` содержит все права для Projects
- [ ] Все кнопки в модулях Habits защищены через `PermissionGuard`
- [ ] Все кнопки в модулях Projects защищены через `PermissionGuard`
- [ ] Нет использования строк вида `'habits:habit:create'` напрямую

### 5.3. Критерии готовности UX

- [ ] Поиск в дереве прав работает (фильтрует по названию действия)
- [ ] На странице участников есть поиск по имени/email
- [ ] На странице участников есть фильтр по системным ролям
- [ ] При удалении роли появляется confirm модалка
- [ ] При снятии роли с пользователя появляется confirm
- [ ] При отзыве права появляется confirm

### 5.4. Критерии готовности типов

- [ ] Скрипт генерации типов написан и работает
- [ ] CI/CD автоматически создаёт PR при изменении `permission_catalog`
- [ ] Все использования прав в коде импортируют из `config.ts`
- [ ] ESLint правило запрещает прямые строки
- [ ] В development режиме доступен PermissionDebugger

---

## 6. Итоговый план по времени

| Этап            | Задачи                        | Время      | Кто             |
| --------------- | ----------------------------- | ---------- | --------------- |
| **Этап 1**      | Наследование ролей (опционально) | 1 неделя | Фронтенд        |
| **Этап 2**      | Конфиги Habits и Projects     | 1 неделя   | Фронтенд        |
| **Этап 3**      | Улучшения UX (поиск, фильтры) | 1.5 недели | Фронтенд        |
| **Этап 4**      | DevTools                      | 0.5 недели | Фронтенд        |
| **Параллельно** | Генерация типов               | 1 день     | Бэкенд + DevOps |

**Итого:** ~3 недели (без наследования) до полного завершения управления ролями

---

## 7. Чек-лист для передачи в разработку

### Бэкенд

- [ ] API наследования работает (POST/DELETE)
- [ ] Скрипт генерации типов готов
- [ ] CI/CD настроен

### Фронтенд

- [ ] Наследование реализовано в UI (опционально)
- [ ] Habits защищён правами
- [ ] Projects защищён правами
- [ ] Поиск в дереве прав работает
- [ ] Поиск и фильтры на странице участников
- [ ] Confirm модалки везде
- [ ] PermissionDebugger доступен
- [ ] ESLint правило настроено

### DevOps

- [ ] GitHub Actions workflow для генерации типов
- [ ] Автоматическое создание PR при изменениях

---

**Документ обновлен:** Март 2026  
**Версия:** 5.0  
**Статус:** План завершения управления ролями
