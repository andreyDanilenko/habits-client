<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <p class="text-sm text-text-secondary">
        Роли пользователя
      </p>
      <Button size="md" variant="secondary" @click="isAdding = !isAdding">
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

    <div v-if="isAdding" class="flex items-center gap-2">
      <select
        v-model="selectedRoleId"
        class="border border-border-default rounded-md px-2 py-1 text-sm bg-bg-primary text-text-primary"
      >
        <option value="">Выберите роль</option>
        <option
          v-for="role in selectableRoles"
          :key="role.id"
          :value="role.id"
        >
          {{ role.name }}
        </option>
      </select>
      <Button size="md" :disabled="!selectedRoleId" @click="onAdd">
        Назначить
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/shared/ui'
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

