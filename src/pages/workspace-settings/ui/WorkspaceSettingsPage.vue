<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Баннер для пользователей без прав на редактирование -->
    <div
      v-if="!canEditWorkspace"
      class="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg"
    >
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
          :disabled="!canEditWorkspace"
        />

        <Textarea
          v-model="workspaceData.description"
          label="Описание"
          :rows="3"
          placeholder="Введите описание workspace"
          :disabled="!canEditWorkspace"
        />

        <div>
          <label class="block text-sm font-medium text-text-secondary mb-2">Цвет</label>
          <div class="flex gap-2">
            <input
              v-model="workspaceData.color"
              type="color"
              :disabled="!canEditWorkspace"
              class="h-10 w-20 border border-border-default rounded cursor-pointer disabled:cursor-not-allowed bg-bg-primary"
            />
            <Input
              v-model="workspaceData.color"
              type="text"
              placeholder="#000000"
              :disabled="!canEditWorkspace"
              class="flex-1"
            />
          </div>
        </div>

        <!-- Брендинг -->
        <div class="pt-4 space-y-4 border-t border-border-light">
          <div>
            <h2 class="text-text-primary mb-2">Брендинг</h2>
            <p class="text-sm text-text-secondary">Лого и размер названия применяются в шапке приложения.</p>
          </div>

          <div class="flex items-center gap-(--spacing-4)">
            <div
              class="w-16 h-16 rounded-lg border border-border-default bg-bg-tertiary overflow-hidden flex items-center justify-center"
            >
              <img
                v-if="workspaceData.logoUrl"
                :src="workspaceData.logoUrl"
                alt="Workspace logo"
                class="object-contain w-full h-full"
              />
              <span v-else class="text-text-muted text-sm font-bold">Лого</span>
            </div>

            <div class="flex-1 min-w-0">
              <input
                ref="logoFileInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                :disabled="!canEditWorkspace"
                @change="onLogoSelected"
              />
              <Button
                variant="outline"
                :disabled="!canEditWorkspace || isUploadingLogo"
                :loading="isUploadingLogo"
                @click="logoFileInputRef?.click()"
              >
                Загрузить лого
              </Button>
              <div v-if="workspaceData.logoUrl" class="mt-2">
                <Button
                  variant="outline"
                  :disabled="!canEditWorkspace || isUploadingLogo || isClearingLogo"
                  :loading="isClearingLogo"
                  @click="clearLogoToSystem"
                >
                  Системное лого
                </Button>
              </div>
              <p class="text-xs text-text-muted mt-2">Форматы: JPEG/PNG/GIF/WebP. Ограничение: 10 МБ.</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-secondary mb-2">
              Масштаб логотипа и названия: <span class="text-text-primary">{{ workspaceData.logoScale.toFixed(2) }}</span>
            </label>
            <input
              type="range"
              min="0.7"
              max="1.6"
              step="0.05"
              v-model.number="workspaceData.logoScale"
              class="w-full"
              :disabled="!canEditWorkspace"
            />
            <p class="text-xs text-text-muted mt-1">Применится после нажатия “Сохранить изменения”.</p>
          </div>
        </div>

        <div v-if="canEditWorkspace" class="pt-4">
          <Button @click="saveWorkspace" :loading="isSaving"> Сохранить изменения </Button>
        </div>
      </div>
    </Card>

    <!-- Участники -->
    <Card v-if="canEditWorkspace" class="p-6">
      <h2 class="text-text-primary mb-4">Участники</h2>
      <div class="space-y-4">
        <p class="text-sm text-text-secondary">
          Управление участниками workspace, назначение ролей и прав доступа.
        </p>
        <router-link
          to="/settings/members"
          class="inline-flex items-center text-primary-default hover:text-primary-dark font-medium"
        >
          Перейти к участникам →
        </router-link>
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
        Чтобы открывать HabitFlow как приложение с главного экрана: на телефоне в меню браузера
        выберите
        <strong>«Добавить на главный экран»</strong> или <strong>«Установить приложение»</strong>;
        на компьютере — пункт <strong>«Установить HabitFlow»</strong> в меню браузера.
      </p>
    </Card>

    <!-- Права доступа -->
    <Card v-if="canEditWorkspace" class="p-6">
      <h2 class="text-text-primary mb-4">Права доступа</h2>
      <div class="space-y-4">
        <p class="text-sm text-text-secondary">Управляйте ролями workspace и их правами доступа.</p>
        <router-link
          to="/workspace-settings/roles"
          class="inline-flex items-center text-primary-default hover:text-primary-dark font-medium"
        >
          Перейти к управлению ролями →
        </router-link>
      </div>
    </Card>

    <!-- Опасная зона (только владелец может удалить workspace) -->
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
  import { ref } from 'vue'
  import { useWorkspaceSettingsPage } from '@/features/workspace/model'
  import { Card, Button, Input, Textarea } from '@/shared/ui'

  const {
    isSaving,
    workspaceData,
    isOwner,
    canEditWorkspace,
    saveWorkspace,
    uploadLogo,
    isUploadingLogo,
    isClearingLogo,
    clearLogoToSystem,
    handleDeleteWorkspace,
  } = useWorkspaceSettingsPage()

  const logoFileInputRef = ref<HTMLInputElement | null>(null)

  const onLogoSelected = async (e: Event) => {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    await uploadLogo(file)
    input.value = ''
  }
</script>
