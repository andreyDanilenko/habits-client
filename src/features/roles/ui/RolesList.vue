<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-text-primary">Роли workspace</h1>
        <p class="mt-1 text-sm text-text-secondary">Управляйте кастомными ролями и их правами.</p>
      </div>
      <Button variant="primary" @click="openCreate"> Создать роль </Button>
    </div>

    <div v-if="isError" class="text-sm text-red-600">Не удалось загрузить список ролей.</div>

    <div v-if="isLoading" class="text-sm text-text-secondary">Загрузка ролей…</div>

    <div class="space-y-4" v-if="!isLoading || roles.length">
      <div v-if="systemRoles.length" class="space-y-2">
        <h2 class="text-sm font-semibold text-text-secondary">Системные роли</h2>
        <div class="space-y-2">
          <RoleCard v-for="role in systemRoles" :key="role.id" :role="role" @edit="onEdit" />
        </div>
      </div>

      <div class="space-y-2">
        <h2 class="text-sm font-semibold text-text-secondary">Кастомные роли</h2>
        <div v-if="customRoles.length" class="space-y-2">
          <RoleCard
            v-for="role in customRoles"
            :key="role.id"
            :role="role"
            @edit="onEdit"
            @delete="onDelete"
          />
        </div>
        <p v-else class="text-sm text-text-secondary">
          Пока нет кастомных ролей. Создайте первую роль для вашей команды.
        </p>
      </div>
    </div>

    <RoleFormModal
      v-model="isModalOpen"
      :role="editingRole"
      :initial-permissions="editingPermissions"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { Button } from '@/shared/ui'
  import { useRolesPage } from '../model/use-roles-page'
  import RoleCard from './RoleCard.vue'
  import RoleFormModal from './RoleFormModal.vue'
  import { roleService } from '@/entities/role'
  import type { Role, PermissionString } from '@/entities/role'

  const { roles, systemRoles, customRoles, isLoading, isError, fetchRoles, deleteRole } =
    useRolesPage()

  const isModalOpen = ref(false)
  const editingRole = ref<Role | null>(null)
  const editingPermissions = ref<PermissionString[] | undefined>(undefined)

  const openCreate = () => {
    editingRole.value = null
    editingPermissions.value = undefined
    isModalOpen.value = true
  }

  const onEdit = async (role: Role) => {
    editingRole.value = role
    try {
      // Загружаем права роли отдельным запросом, чтобы не тянуть их в список
      const workspaceId = role.workspaceId
      const permissions = await roleService.getPermissions(workspaceId, role.id)
      editingPermissions.value = permissions
    } catch {
      editingPermissions.value = []
    }
    isModalOpen.value = true
  }

  const onDelete = async (role: Role) => {
    if (role.isSystem) return
    // Предполагается, что UI верхнего уровня добавит диалог подтверждения при необходимости
    await deleteRole(role.id)
  }

  const handleSaved = async () => {
    await fetchRoles()
  }

  onMounted(() => {
    void fetchRoles()
  })
</script>
