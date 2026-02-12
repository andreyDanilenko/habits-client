<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">Админ-панель</h1>
      <p class="mt-2 text-gray-600">
        Список пользователей и их воркспейсы. Только для администраторов.
      </p>
    </div>

    <Card class="p-6">
      <h2 class="mb-4 text-lg font-medium text-gray-900">Пользователи</h2>

      <div v-if="isLoading" class="flex justify-center py-8">
        <Spinner />
      </div>

      <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>

      <div v-else-if="users.length === 0" class="py-8 text-center text-gray-500">
        Нет пользователей
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="user in users"
          :key="user.id"
          class="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-medium text-gray-900">{{ user.name || user.email }}</span>
              <Badge v-if="user.role === 'ADMIN'" variant="indigo">{{ user.role }}</Badge>
              <Badge v-else variant="default">{{ user.role }}</Badge>
            </div>
            <p class="mt-0.5 text-sm text-gray-500">{{ user.email }}</p>
            <div v-if="user.workspaces?.length" class="mt-2">
              <p class="text-xs font-medium text-gray-600 mb-1">Воркспейсы:</p>
              <div class="flex flex-wrap gap-1.5 items-center">
                <span
                  v-for="ws in user.workspaces"
                  :key="ws.id"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                >
                  {{ ws.name }}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    class="!p-0.5 !min-w-0 h-5 text-xs"
                    title="Перейти в этот воркспейс"
                    @click="switchToWorkspace(ws.id)"
                  >
                    Открыть
                  </Button>
                </span>
              </div>
            </div>
            <p v-else class="mt-2 text-xs text-gray-400">Нет воркспейсов</p>
          </div>
          <div class="flex-shrink-0">
            <Button
              variant="danger"
              size="sm"
              :disabled="user.id === currentUserId"
              :title="user.id === currentUserId ? 'Нельзя удалить себя' : 'Удалить пользователя'"
              @click="openDeleteConfirm(user)"
            >
              Удалить
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <Modal :is-open="showDeleteModal" @update:is-open="showDeleteModal = $event">
      <ConfirmModal
        title="Удалить пользователя?"
        description="Это действие нельзя отменить."
        :message="deleteTarget ? `Пользователь ${deleteTarget.email} будет удалён (деактивирован).` : ''"
        confirm-text="Удалить"
        confirm-variant="danger"
        @close="closeDeleteConfirm"
        @confirm="confirmDelete"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { Card, Button, Badge, Spinner, Modal, ConfirmModal } from '@/shared/ui'
  import { adminService, type AdminUserWithWorkspaces } from '@/features/admin'
  import { useUserStore } from '@/entities/user'
  import { useWorkspaceStore } from '@/entities/workspace'

  const router = useRouter()
  const userStore = useUserStore()
  const workspaceStore = useWorkspaceStore()
  const currentUserId = computed(() => userStore.currentUser?.id ?? null)

  const users = ref<AdminUserWithWorkspaces[]>([])
  const isLoading = ref(true)
  const error = ref('')
  const showDeleteModal = ref(false)
  const deleteTarget = ref<AdminUserWithWorkspaces | null>(null)
  const isDeleting = ref(false)

  const fetchUsers = async () => {
    isLoading.value = true
    error.value = ''
    try {
      users.value = await adminService.getUsers()
    } catch (e: any) {
      const status = e?.response?.status
      if (status === 403) {
        error.value = 'Доступ запрещён. Только для администраторов.'
      } else {
        error.value = 'Не удалось загрузить список пользователей.'
      }
    } finally {
      isLoading.value = false
    }
  }

  const openDeleteConfirm = (user: AdminUserWithWorkspaces) => {
    deleteTarget.value = user
    showDeleteModal.value = true
  }

  const closeDeleteConfirm = () => {
    showDeleteModal.value = false
    deleteTarget.value = null
  }

  const confirmDelete = async () => {
    if (!deleteTarget.value) return
    isDeleting.value = true
    try {
      await adminService.deleteUser(deleteTarget.value.id)
      closeDeleteConfirm()
      await fetchUsers()
    } catch (e: any) {
      if (e?.response?.status === 403) {
        error.value = 'Доступ запрещён.'
      } else {
        error.value = 'Не удалось удалить пользователя.'
      }
    } finally {
      isDeleting.value = false
    }
  }

  const switchToWorkspace = async (workspaceId: string) => {
    try {
      await workspaceStore.switchWorkspace(workspaceId)
      router.push('/habits/dashboard')
    } catch (e) {
      console.error('Failed to switch workspace:', e)
      error.value = 'Не удалось переключиться на воркспейс.'
    }
  }

  onMounted(() => {
    fetchUsers()
  })
</script>
