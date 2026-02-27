<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Баннер для не-владельцев -->
    <div v-if="!isOwner" class="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <p class="text-sm text-yellow-800 dark:text-yellow-300">
        У вас нет прав для редактирования этого workspace. Доступ только для просмотра.
      </p>
    </div>

    <!-- Заголовок -->
    <div>
      <h1 class="text-text-primary">Настройки Workspace</h1>
      <p class="mt-2 text-text-secondary">Управляйте настройками вашего workspace</p>
    </div>

    <!-- Основная информация -->
    <Card class="p-6">
      <h2 class="text-text-primary mb-4">Основная информация</h2>

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
          <label class="block text-sm font-medium text-text-secondary mb-2">Описание</label>
          <textarea
            v-model="workspaceData.description"
            name="description"
            rows="3"
            placeholder="Введите описание workspace"
            :disabled="!isOwner"
            class="w-full px-3 py-2 border border-border-default rounded-md shadow-sm focus:outline-none focus:ring-primary-default focus:border-primary-default disabled:bg-bg-tertiary disabled:cursor-not-allowed bg-bg-primary text-text-primary placeholder:text-text-muted"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-text-secondary mb-2">Цвет</label>
          <div class="flex gap-2">
            <input
              v-model="workspaceData.color"
              type="color"
              :disabled="!isOwner"
              class="h-10 w-20 border border-border-default rounded cursor-pointer disabled:cursor-not-allowed bg-bg-primary"
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
      <h2 class="text-text-primary mb-4">Участники</h2>
      <div class="space-y-4">
        <div class="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p class="text-sm text-blue-800 dark:text-blue-300">
            <span class="font-semibold">Soon:</span> Управление участниками workspace, назначение
            ролей и прав доступа.
          </p>
        </div>
      </div>
    </Card>

    <!-- Модули -->
    <Card class="p-6">
      <h2 class="text-text-primary mb-4">Модули</h2>
      <div class="space-y-4">
        <p class="text-sm text-text-secondary">Просмотр и включение модулей для этого workspace.</p>
        <router-link
          to="/workspace-modules"
          class="inline-flex items-center text-primary-default hover:text-primary-dark font-medium"
        >
          Перейти к списку модулей →
        </router-link>
      </div>
    </Card>

    <!-- Приложение: ярлык на рабочий стол -->
    <Card class="p-6">
      <h2 class="text-text-primary mb-4">Приложение</h2>
      <p class="text-sm text-text-secondary">
        Чтобы открывать HabitFlow как приложение с главного экрана: на телефоне в меню браузера выберите
        <strong>«Добавить на главный экран»</strong> или <strong>«Установить приложение»</strong>;
        на компьютере — пункт <strong>«Установить HabitFlow»</strong> в меню браузера.
      </p>
    </Card>

    <!-- Права доступа (Soon) -->
    <Card v-if="isOwner" class="p-6">
      <h2 class="text-text-primary mb-4">Права доступа</h2>
      <div class="space-y-4">
        <div class="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p class="text-sm text-blue-800 dark:text-blue-300">
            <span class="font-semibold">Soon:</span> Настройка детальных прав доступа для ролей
            (ADMIN, MEMBER, GUEST).
          </p>
        </div>
      </div>
    </Card>

    <!-- Опасная зона -->
    <Card v-if="isOwner" class="p-6 border-red-200 dark:border-red-900">
      <h2 class="text-red-900 dark:text-red-400 mb-4">Опасная зона</h2>

      <div class="space-y-4">
        <div>
          <p class="text-sm text-text-secondary mb-2">
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
