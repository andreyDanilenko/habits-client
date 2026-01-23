<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div v-if="!isOwner" class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p class="text-sm text-yellow-800">
        У вас нет прав для редактирования этого workspace. Доступ только для просмотра.
      </p>
    </div>

    <div>
      <h1 class="text-3xl font-bold text-gray-900">Настройки Workspace</h1>
      <p class="mt-2 text-gray-600">Управляйте настройками вашего workspace</p>
    </div>

    <Card class="p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Основная информация</h2>

      <div class="space-y-4">
        <Input
          v-model="workspaceData.name"
          label="Название"
          type="text"
          name="name"
          placeholder="Введите название workspace"
          :disabled="!isOwner"
        />

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Описание</label>
          <textarea
            v-model="workspaceData.description"
            name="description"
            rows="3"
            placeholder="Введите описание workspace"
            :disabled="!isOwner"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Цвет</label>
          <div class="flex gap-2">
            <input
              v-model="workspaceData.color"
              type="color"
              :disabled="!isOwner"
              class="h-10 w-20 border border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
            />
            <Input
              v-model="workspaceData.color"
              type="text"
              placeholder="#000000"
              :disabled="!isOwner"
              class="flex-1"
            />
          </div>
        </div>

        <div v-if="isOwner" class="pt-4">
          <Button @click="saveWorkspace" :loading="isSaving"> Сохранить изменения </Button>
        </div>
      </div>
    </Card>

    <!-- Участники (Soon) -->
    <Card v-if="isOwner" class="p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Участники</h2>
      <div class="space-y-4">
        <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-blue-800">
            <span class="font-semibold">Soon:</span> Управление участниками workspace, назначение
            ролей и прав доступа.
          </p>
        </div>
        <!-- TODO: Список участников будет здесь -->
      </div>
    </Card>

    <!-- Модули (Soon) -->
    <Card v-if="isOwner" class="p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Модули</h2>
      <div class="space-y-4">
        <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-blue-800">
            <span class="font-semibold">Soon:</span> Настройка доступных модулей для workspace
            (Привычки, Журнал, Задачи и т.д.).
          </p>
        </div>
        <!-- TODO: Список модулей будет здесь -->
      </div>
    </Card>

    <!-- Права доступа (Soon) -->
    <Card v-if="isOwner" class="p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Права доступа</h2>
      <div class="space-y-4">
        <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-blue-800">
            <span class="font-semibold">Soon:</span> Настройка детальных прав доступа для ролей
            (ADMIN, MEMBER, GUEST).
          </p>
        </div>
        <!-- TODO: Настройки прав доступа будут здесь -->
      </div>
    </Card>

    <!-- Опасная зона -->
    <Card v-if="isOwner" class="p-6 border-red-200">
      <h2 class="text-xl font-semibold text-red-900 mb-4">Опасная зона</h2>

      <div class="space-y-4">
        <div>
          <p class="text-sm text-gray-700 mb-2">
            Удаление workspace приведет к безвозвратному удалению всех данных, включая привычки,
            журналы и другие данные.
          </p>
          <Button variant="danger" @click="showDeleteConfirm = true"> Удалить workspace </Button>
        </div>
      </div>
    </Card>

    <!-- Модальное окно подтверждения удаления -->
    <Modal :is-open="showDeleteConfirm" @close="showDeleteConfirm = false">
      <ConfirmModal
        title="Удалить workspace?"
        message="Это действие нельзя отменить. Все данные workspace будут безвозвратно удалены."
        confirm-text="Удалить"
        confirm-variant="danger"
        @confirm="handleDelete"
        @close="showDeleteConfirm = false"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { Card, Button, Input, ConfirmModal, Modal } from '@/shared/ui'
  import { useUserStore } from '@/entities/user'
  import { useWorkspaceStore, usePermissions } from '@/entities/workspace'

  const router = useRouter()
  const userStore = useUserStore()
  const workspaceStore = useWorkspaceStore()
  const { isOwner } = usePermissions()

  const isSaving = ref(false)
  const showDeleteConfirm = ref(false)
  const isDeleting = ref(false)

  const workspaceData = reactive({
    name: '',
    description: '',
    color: '#6366f1',
  })

  onMounted(async () => {
    if (!workspaceStore.currentWorkspace) {
      router.push('/')
      return
    }

    if (!isOwner.value) {
      // Если не владелец, можно только просматривать
      workspaceData.name = workspaceStore.currentWorkspace.name
      workspaceData.description = workspaceStore.currentWorkspace.description || ''
      workspaceData.color = workspaceStore.currentWorkspace.color || '#6366f1'
      return
    }

    // Загружаем данные workspace
    workspaceData.name = workspaceStore.currentWorkspace.name
    workspaceData.description = workspaceStore.currentWorkspace.description || ''
    workspaceData.color = workspaceStore.currentWorkspace.color || '#6366f1'
  })

  const saveWorkspace = async () => {
    if (!isOwner.value || !workspaceStore.currentWorkspace) {
      return
    }

    isSaving.value = true
    try {
      await workspaceStore.updateWorkspace(workspaceStore.currentWorkspace.id, {
        name: workspaceData.name,
        description: workspaceData.description || undefined,
        color: workspaceData.color || undefined,
      })
    } catch (error) {
      console.error('Failed to save workspace:', error)
    } finally {
      isSaving.value = false
    }
  }

  const handleDelete = async () => {
    if (!isOwner.value || !workspaceStore.currentWorkspace) {
      return
    }

    isDeleting.value = true
    try {
      await workspaceStore.deleteWorkspace(workspaceStore.currentWorkspace.id)
      router.push('/')
    } catch (error) {
      console.error('Failed to delete workspace:', error)
    } finally {
      isDeleting.value = false
      showDeleteConfirm.value = false
    }
  }
</script>
