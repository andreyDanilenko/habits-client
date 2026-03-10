<template>
  <div class="space-y-2 min-w-0">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <p class="text-sm text-text-secondary">Роли пользователя</p>
      <Button size="md" variant="secondary" class="flex-shrink-0" @click="isAdding = !isAdding">
        Добавить роль
      </Button>
    </div>

    <div class="flex flex-wrap gap-2">
      <span
        v-for="role in customRoles"
        :key="role.id"
        class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-bg-tertiary text-xs text-text-primary"
      >
        <span>{{ role.name }}</span>
        <button
          type="button"
          class="text-text-secondary hover:text-red-500"
          @click="onRemove(role.id)"
        >
          ×
        </button>
      </span>
      <span v-if="!customRoles.length" class="text-xs text-text-secondary">
        Кастомные роли не назначены.
      </span>
    </div>

    <div v-if="isAdding" class="flex flex-wrap items-center gap-2">
      <div class="min-w-[160px] flex-1">
        <Select
          v-model="selectedRoleId"
          :options="roleSelectOptions"
          placeholder="Выберите роль"
          size="md"
        />
      </div>
      <Button size="md" class="flex-shrink-0" :disabled="!selectedRoleId" @click="onAdd">
        Назначить
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { Button, Select } from '@/shared/ui'
  import { useMemberRoles } from '@/features/members/model/use-member-roles'

  const props = defineProps<{
    userId: string
  }>()

  const { availableRoles, customRoles, assignRole, revokeRole } = useMemberRoles(props.userId)

  const isAdding = ref(false)
  const selectedRoleId = ref('')

  const selectableRoles = computed(() => {
    const assignedIds = new Set(customRoles.value.map((r) => r.id))
    return availableRoles.value.filter((r) => !r.isSystem && !assignedIds.has(r.id))
  })

  const roleSelectOptions = computed(() =>
    selectableRoles.value.map((r) => ({ value: r.id, label: r.name })),
  )

  const onAdd = async () => {
    if (!selectedRoleId.value) return
    await assignRole(selectedRoleId.value)
    selectedRoleId.value = ''
    isAdding.value = false
  }

  const onRemove = async (roleId: string) => {
    await revokeRole(roleId)
  }
</script>
