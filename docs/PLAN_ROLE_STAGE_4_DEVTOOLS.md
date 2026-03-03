## PLAN_ROLE_STAGE_4_DEVTOOLS — DevTools и генерация типов прав (Этап 4)

### Цель этапа

Сделать систему прав прозрачной и безопасной для разработки:
- иметь возможность быстро посмотреть текущие права пользователя в UI (devtools),
- жёстко согласовать `PermissionString` между бэкендом и фронтендом через генерацию типов,
- предотвратить появление “магических” строк прав в коде линтерами.

---

### 1. PermissionDebugger — devtools-компонент

**Задача:** показать в интерфейсе (в dev-режиме), какие права/роли есть у текущего пользователя и дать возможность проверить конкретное право.

- **Реализовать компонент `features/devtools/PermissionDebugger.vue`:**

  - Структура:

  ```vue
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
            <span
              v-for="perm in permissions"
              :key="perm"
              class="permission-tag"
            >
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

- **Интеграция:**
  - Подключить `PermissionDebugger` в `App.vue` (или в шапку) только в dev-режиме.

---

### 2. Генерация типов `PermissionString` из бэкенда

**Задача:** гарантировать, что фронт не может использовать несуществующее право, и минимизировать ручную работу при добавлении прав на бэкенде.

- **Идея (описана в `PLAN_ROLE.md`):**
  - На бэкенде есть таблица `permission_catalog` со всеми правами.
  - Скрипт в Go (или другом языке) читает все `module_code/entity_type/action` и генерирует файл  
    `frontend/src/generated/permission.types.ts` с:
    - `export type PermissionString = 'crm:deal:create' | ...`,
    - `export const ALL_PERMISSIONS: PermissionString[] = [...]`,
    - `export function isValidPermission(perm: string): perm is PermissionString`.

- **Использование на фронтенде:**
  - В `features/permissions/config.ts` импортировать `PermissionString` из `generated/permission.types.ts`.
  - Все конфиги прав (`CRM_PERMISSIONS`, `HABITS_PERMISSIONS`, `PROJECTS_PERMISSIONS`) будут проверяться TypeScript’ом на соответствие актуальному списку.

- **CI/CD (по плану):**
  - GitHub Actions/другая CI собирает права из БД и генерирует `permission.types.ts` при изменении миграций/каталога.
  - Создаётся отдельный PR с изменённым `permission.types.ts`, чтобы фронт всегда был синхронизирован.

> Реализация самого Go-скрипта и CI-пайплайна — зона бэкенда/DevOps; фронт должен быть готов принимать обновлённый тип.

---

### 3. Линтер для запрета прямых строк прав

**Задача:** не допустить появления "магических" строк вида `'crm:deal:create'` в произвольных местах кода.

- **ESLint правило (идея из плана):**

  ```js
  // .eslintrc.js
  module.exports = {
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^[a-z]+:[a-z]+:[a-z]+$/]',
          message: 'Используйте константы из features/permissions/config.ts вместо строк.',
        },
      ],
    },
  }
  ```

- **Требование:**
  - Вся работа с правами должна происходить:
    - либо через константы из конфигов (`CRM_PERMISSIONS`, `HABITS_PERMISSIONS`, `PROJECTS_PERMISSIONS`),
    - либо через значения из каталога/эффективных прав.

---

### 4. Критерии готовности (Definition of Done для Этапа 4)

- В dev-режиме приложению доступен `PermissionDebugger`, показывающий:
  - системную роль,
  - кастомные роли,
  - полный список прав (`PermissionString[]`),
  - результат проверки произвольного права через `can()`.
- На фронте тип `PermissionString` импортируется из сгенерированного файла (когда внедрится бекенд-скрипт).
- ESLint-правило, запрещающее прямые строки прав, настроено и не конфликтует с существующим кодом.
- Конфиги прав (`CRM_PERMISSIONS`, `HABITS_PERMISSIONS`, `PROJECTS_PERMISSIONS`) и весь остальной код используют только типизированные константы.

