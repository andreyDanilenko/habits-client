<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-semibold text-text-primary">Админ-панель</h1>
      <p class="mt-2 text-text-secondary">
        Список пользователей. Бан, деактивация, жёсткое удаление.
      </p>
    </div>

    <Card class="p-6">
      <h2 class="mb-4 text-lg font-medium text-text-primary">Пользователи</h2>

      <div v-if="isLoading" class="flex justify-center py-8">
        <Spinner />
      </div>

      <div v-else-if="error" class="p-4 bg-error-light border border-error-border rounded-lg">
        <p class="text-sm text-error-default">{{ error }}</p>
      </div>

      <div v-else-if="users.length === 0" class="py-8 text-center text-text-muted">
        Нет пользователей
      </div>

      <div v-else class="divide-y divide-border-light">
        <div
          v-for="user in users"
          :key="user.id"
          class="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          :class="{ 'opacity-60': user.status === 'DELETED' || user.status === 'BANNED' }"
        >
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-medium text-text-primary">{{ user.name || user.email }}</span>
              <Badge v-if="user.role === 'ADMIN'" variant="indigo">{{ user.role }}</Badge>
              <Badge v-else variant="default">{{ user.role }}</Badge>
              <Badge
                v-if="user.status === 'DELETED'"
                variant="default"
                class="!bg-error-light !text-error-default"
              >
                Удалён
              </Badge>
              <Badge
                v-if="user.status === 'BANNED'"
                variant="default"
                class="!bg-warning-light !text-warning-default"
              >
                Забанен
              </Badge>
            </div>
            <p class="mt-0.5 text-sm text-text-secondary">{{ user.email }}</p>
            <div
              v-if="user.workspaces?.length && user.status === 'ACTIVE'"
              class="mt-2"
            >
              <p class="text-xs font-medium text-text-secondary mb-1">Воркспейсы:</p>
              <div class="flex flex-wrap gap-1.5 items-center">
                <span
                  v-for="ws in user.workspaces"
                  :key="ws.id"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-bg-tertiary text-text-primary"
                >
                  {{ ws.name }}
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    class="!p-0.5 !min-w-0 h-5 text-xs"
                    title="Перейти в этот воркспейс"
                    @click="switchToWorkspace(ws.id)"
                  >
                    Открыть
                  </Button>
                </span>
              </div>
            </div>
            <p v-else-if="user.status === 'ACTIVE'" class="mt-2 text-xs text-text-muted">
              Нет воркспейсов
            </p>
          </div>
          <div class="flex-shrink-0 flex flex-wrap gap-2">
            <Button
              v-if="user.status === 'BANNED'"
              variant="outline"
              size="md"
              :disabled="user.id === currentUserId"
              title="Снять бан"
              @click="unbanUser(user)"
            >
              Разбанить
            </Button>
            <template v-else-if="user.status === 'ACTIVE'">
              <Button
                variant="outline"
                size="md"
                :disabled="user.id === currentUserId"
                title="Заблокировать вход"
                @click="banUser(user)"
              >
                Забанить
              </Button>
              <Button
                variant="outline"
                size="md"
                :disabled="user.id === currentUserId"
                title="Деактивировать (можно восстановить при повторной регистрации)"
                @click="openDeleteConfirm(user, 'soft')"
              >
                Деактивировать
              </Button>
            </template>
            <Button
              variant="danger"
              size="md"
              :disabled="user.id === currentUserId"
              :title="
                user.id === currentUserId
                  ? 'Нельзя удалить себя'
                  : user.status === 'DELETED'
                    ? 'Удалить навсегда из БД'
                    : 'Удалить навсегда (без восстановления)'
              "
              @click="openDeleteConfirm(user, 'hard')"
            >
              Удалить навсегда
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <Modal
      :is-open="showDeleteModal"
      @update:is-open="(v) => { showDeleteModal = v; if (!v) closeDeleteConfirm() }"
    >
      <ModalContent
        :title="deleteMode === 'hard' ? 'Удалить навсегда?' : 'Деактивировать пользователя?'"
        :description="
          deleteMode === 'hard'
            ? 'Пользователь будет безвозвратно удалён из базы данных. Это действие нельзя отменить.'
            : 'Пользователь будет деактивирован. Он не сможет войти, но данные сохранятся. Можно восстановить при повторной регистрации с тем же email.'
        "
        @close="closeDeleteConfirm"
      >
        <template #default>
          <p v-if="deleteTarget" class="text-text-primary">
            {{ deleteTarget.email }}
            <span v-if="deleteTarget.name" class="text-text-secondary"> — {{ deleteTarget.name }}</span>
          </p>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <Button type="button" variant="outline" @click="closeDeleteConfirm">
              Отмена
            </Button>
            <Button
              v-if="deleteMode === 'soft'"
              type="button"
              variant="outline"
              :loading="isDeleting"
              @click="confirmDelete(false)"
            >
              Деактивировать
            </Button>
            <Button
              type="button"
              variant="danger"
              :loading="isDeleting"
              @click="confirmDelete(true)"
            >
              {{ deleteMode === 'hard' ? 'Удалить навсегда' : 'Удалить навсегда' }}
            </Button>
          </div>
        </template>
      </ModalContent>
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { Card, Button, Badge, Spinner, Modal, ModalContent } from '@/shared/ui'
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
  const deleteMode = ref<'soft' | 'hard'>('soft')
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

  const openDeleteConfirm = (user: AdminUserWithWorkspaces, mode: 'soft' | 'hard') => {
    deleteTarget.value = user
    deleteMode.value = mode
    showDeleteModal.value = true
  }

  const closeDeleteConfirm = () => {
    showDeleteModal.value = false
    deleteTarget.value = null
  }

  const confirmDelete = async (permanent: boolean) => {
    if (!deleteTarget.value) return
    isDeleting.value = true
    try {
      await adminService.deleteUser(deleteTarget.value.id, permanent)
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

  const banUser = async (user: AdminUserWithWorkspaces) => {
    try {
      await adminService.banUser(user.id)
      await fetchUsers()
    } catch (e: any) {
      if (e?.response?.status === 403) {
        error.value = 'Доступ запрещён.'
      } else {
        error.value = 'Не удалось забанить пользователя.'
      }
    }
  }

  const unbanUser = async (user: AdminUserWithWorkspaces) => {
    try {
      await adminService.unbanUser(user.id)
      await fetchUsers()
    } catch (e: any) {
      if (e?.response?.status === 403) {
        error.value = 'Доступ запрещён.'
      } else {
        error.value = 'Не удалось разбанить пользователя.'
      }
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
