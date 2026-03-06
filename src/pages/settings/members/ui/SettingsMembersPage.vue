<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <div>
      <h1 class="text-text-primary">Участники</h1>
      <p class="mt-2 text-text-secondary">
        Управляйте участниками workspace, их ролями и индивидуальными правами.
      </p>
    </div>

    <div v-if="isLoading" class="text-sm text-text-secondary">Загрузка списка участников…</div>

    <div v-else-if="isError" class="text-sm text-red-600">Не удалось загрузить участников.</div>

    <div v-else class="space-y-4">
      <Card v-for="member in members" :key="member.id" class="p-4">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <div class="font-medium text-text-primary">
              {{ member.name || member.email }}
            </div>
            <div class="text-xs text-text-secondary">
              {{ member.email }}
            </div>
            <div class="text-xs text-text-secondary">Системная роль: {{ member.systemRole }}</div>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <MemberRoleChips :user-id="member.id" />
          <UserPermissionsPanel :user-id="member.id" />
        </div>
      </Card>
      <p v-if="!members.length" class="text-sm text-text-secondary">
        В этом workspace пока нет участников.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { Card } from '@/shared/ui'
  import { useWorkspaceStore, workspaceService, type Member } from '@/entities/workspace'
  import { MemberRoleChips } from '@/features/members'
  import { UserPermissionsPanel } from '@/features/user-permissions'

  const workspaceStore = useWorkspaceStore()

  const members = ref<Member[]>([])
  const isLoading = ref(false)
  const isError = ref(false)

  const loadMembers = async () => {
    const workspaceId = workspaceStore.currentWorkspace?.id
    if (!workspaceId) {
      members.value = []
      return
    }
    isLoading.value = true
    isError.value = false
    try {
      const response = await workspaceService.getWorkspaceMembers(workspaceId)
      members.value = response as Member[]
    } catch {
      isError.value = true
      members.value = []
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    void loadMembers()
  })
</script>
