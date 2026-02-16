<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div v-if="!isOwner" class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p class="text-sm text-yellow-800">
        У вас нет прав для редактирования этого workspace. Доступ только для просмотра.
      </p>
    </div>

    <div>
      <h1>Настройки Workspace</h1>
      <p class="mt-2 text-gray-600">Управляйте настройками вашего workspace</p>
    </div>

    <Card class="p-6">
      <h2 class="mb-4">Основная информация</h2>

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
      <h2 class="mb-4">Участники</h2>
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

    <!-- Модули -->
    <Card class="p-6">
      <h2 class="mb-4">Модули</h2>
      <div class="space-y-4">
        <p class="text-sm text-gray-600">
          Просмотр и включение модулей для этого workspace.
        </p>
        <router-link
          to="/workspace-modules"
          class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Перейти к списку модулей →
        </router-link>
      </div>
    </Card>

    <!-- Права доступа (Soon) -->
    <Card v-if="isOwner" class="p-6">
      <h2 class="mb-4">Права доступа</h2>
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
      <h2 class="text-red-900 mb-4">Опасная зона</h2>

      <div class="space-y-4">
        <div>
          <p class="text-sm text-gray-700 mb-2">
            Удаление workspace приведет к безвозвратному удалению всех данных, включая привычки,
            журналы и другие данные.
          </p>
          <Button variant="danger" @click="handleDeleteWorkspace"> Удалить workspace </Button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
  import { useWorkspaceSettingsPage } from '@/features/workspace/model'
  import { Card, Button, Input } from '@/shared/ui'

  const { isSaving, workspaceData, isOwner, saveWorkspace, handleDeleteWorkspace } =
    useWorkspaceSettingsPage()
</script>
