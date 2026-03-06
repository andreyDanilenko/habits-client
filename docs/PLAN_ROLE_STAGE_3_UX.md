## PLAN_ROLE_STAGE_3_UX — Улучшения UX для ролей и участников (Этап 3)

### Цель этапа

Сделать работу с ролями, правами и участниками удобной для администраторов: добавить поиск и фильтры, улучшить дерево прав, обеспечить подтверждение опасных действий.

---

### 1. Поиск в дереве прав (`PermissionTree`)

**Задача:** позволить администратору быстро найти нужные права по названию.

- **Расширить `use-permission-tree`:**
  - Добавить состояние:

  ```ts
  const searchQuery = ref('')
  ```

  - Ввести `computed filteredTree`, который:
    - если `searchQuery` пустой — возвращает исходное `tree`,
    - иначе:
      - фильтрует модули, оставляя только те, в которых есть сущности с правами, удовлетворяющими запросу,
      - внутри модулей фильтрует сущности и действия по `action.name` (или дополнительно по `permissionString`).

- **Изменить API `use-permission-tree`:**
  - Возвращать:
    - `tree` (уже отфильтрованное),
    - `searchQuery` (для биндинга из UI),
    - при необходимости — `originalTree` (если нужно полное дерево).

- **Интеграция в `PermissionTree.vue`:**
  - Вверх компонента добавить поле ввода:

  ```vue
  <input
    v-model="searchQuery"
    type="search"
    placeholder="Поиск по названию права…"
    class="w-full mb-2 ..."
  />
  ```

  - Биндить `searchQuery` из хука `usePermissionTree()`.

---

### 2. Поиск и фильтры на странице участников (`/settings/members`)

**Задача:** дать возможность быстро найти участника по имени/email и отфильтровать по системной роли.

- **Создать хук `use-member-filters` (например, `features/members/model/use-member-filters.ts`):**

  ```ts
  import { ref, computed, type Ref } from 'vue'
  import type { Member } from '@/entities/workspace'

  export function useMemberFilters(members: Ref<Member[]>) {
    const searchQuery = ref('')
    const roleFilter = ref<'all' | 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST'>('all')

    const filteredMembers = computed(() =>
      members.value.filter((member) => {
        const q = searchQuery.value.trim().toLowerCase()
        const matchesSearch =
          !q || member.name.toLowerCase().includes(q) || member.email.toLowerCase().includes(q)

        const matchesRole = roleFilter.value === 'all' || member.systemRole === roleFilter.value

        return matchesSearch && matchesRole
      }),
    )

    return { searchQuery, roleFilter, filteredMembers }
  }
  ```

- **Интеграция в `SettingsMembersPage.vue`:**
  - Вместо прямого обхода `members` использовать `filteredMembers` из хука.
  - Добавить UI:
    - инпут поиска по имени/email,
    - селект для фильтра по системной роли (`all/OWNER/ADMIN/MEMBER/GUEST`).

---

### 3. Confirm-модалки для опасных действий

**Задача:** защитить от случайного удаления ролей и прав.

- **Использовать существующий `shared/ui/ConfirmModal` (если есть) или доработать его:**
  - Простой API:
    - `v-model:isOpen`,
    - `title`, `message`,
    - события `confirm`/`cancel`.

- **Где использовать:**
  - В `RolesList`:
    - при удалении кастомной роли,
  - В `MemberRoleChips`:
    - при снятии роли с пользователя,
  - В `UserPermissionsPanel`:
    - при отзыве индивидуального права.

- **Паттерн использования:**

  ```ts
  const confirmState = ref<{ type: 'role' | 'member-role' | 'permission'; id: string } | null>(null)

  const requestDeleteRole = (roleId: string) => {
    confirmState.value = { type: 'role', id: roleId }
  }

  const handleConfirm = async () => {
    if (confirmState.value?.type === 'role') {
      await deleteRole(confirmState.value.id)
    }
    confirmState.value = null
  }
  ```

---

### 4. Мелкие UX-улучшения

- Добавить состояния пустых списков:
  - для ролей, участников, прав.
- Добавить подсказки/tooltips:
  - для унаследованных прав (если Этап 1 уже реализован),
  - для системных ролей на `/settings/members`.
- Визуально подчёркивать элементы, зависящие от прав (например, иконка “замок” у кнопок, недоступных без конкретного права).

---

### 5. Критерии готовности (Definition of Done для Этапа 3)

- В `PermissionTree` работает поиск по названию прав.
- На странице `/settings/members`:
  - реализован поиск по имени/email,
  - реализован фильтр по системной роли.
- Для удаления ролей, снятия ролей с пользователя и отзыва индивидуальных прав используются confirm‑модалки.
- Пустые состояния списков и подсказки оформлены так, что администратору понятно, что происходит.
