<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div>
      <h1 class="text-text-primary">Модули</h1>
      <p class="mt-2 text-text-secondary">
        Доступные и неактивные модули в этом workspace. Включите нужные модули для работы.
      </p>
    </div>

    <!-- Доступные модули -->
    <Card class="p-6">
      <h2 class="mb-4 text-lg font-semibold text-text-primary">Доступные модули</h2>
      <p class="text-sm text-text-secondary mb-4">Эти модули уже включены в вашем workspace.</p>
      <div class="space-y-3">
        <div
          v-for="module in availableModules"
          :key="module.id"
          class="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-border-light bg-bg-secondary/50"
        >
          <component :is="module.icon" class="w-8 h-8 text-primary-default flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-text-primary">{{ module.label }}</p>
            <p class="text-sm text-text-muted">Модуль активен</p>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            <span class="text-sm text-success-default font-medium">Доступен</span>
            <Button
              v-if="canActivateModules"
              variant="outline"
              size="md"
              :loading="disablingModule === module.id"
              @click="openDisableConfirm(module)"
            >
              Отключить
            </Button>
          </div>
        </div>
        <p v-if="availableModules.length === 0" class="text-sm text-text-muted py-2">
          Нет включённых модулей.
        </p>
      </div>
    </Card>

    <!-- Недоступные модули (с заглушкой и кнопкой «Активировать») -->
    <Card class="p-6">
      <h2 class="mb-4 text-lg font-semibold text-text-primary">Недоступные модули</h2>
      <p class="text-sm text-text-secondary mb-4">
        Включите модуль, чтобы использовать его в этом workspace.
      </p>
      <div class="space-y-3">
        <div
          v-for="module in unavailableModules"
          :key="module.id"
          class="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-border-light bg-bg-secondary/30"
        >
          <component :is="module.icon" class="w-8 h-8 text-text-muted flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-text-primary">{{ module.label }}</p>
            <p class="text-sm text-text-secondary mt-0.5">
              Модуль пока не активирован. Нажмите «Активировать», чтобы включить его в workspace.
            </p>
          </div>
          <div class="flex flex-col gap-2 flex-shrink-0">
            <Button
              v-if="canEnableModule(module.id)"
              variant="primary"
              :loading="activatingModule === module.id"
              @click="activateModule(module.id)"
            >
              Активировать
            </Button>
            <template v-else>
              <p v-if="canActivateModules" class="text-sm text-text-muted mb-1">
                Нужна лицензия: купите модуль или запросите выдачу у админа.
              </p>
              <p v-else class="text-sm text-text-muted mb-1">
                Включить модуль может владелец workspace или админ (при наличии лицензии).
              </p>
              <Button variant="secondary" disabled> Перейти к покупке / связь с владельцем </Button>
            </template>
          </div>
        </div>
        <p v-if="unavailableModules.length === 0" class="text-sm text-text-muted py-2">
          Все модули уже включены.
        </p>
      </div>
    </Card>

    <Modal :is-open="showDisableModal" @update:is-open="showDisableModal = $event">
      <ConfirmModal
        title="Отключить модуль?"
        :message="
          disableTarget
            ? `Модуль «${disableTarget.label}» будет отключён только в этом workspace (для видимости). Лицензия сохраняется — включить снова можно без покупки. Продолжить?`
            : ''
        "
        confirm-text="Отключить"
        confirm-variant="danger"
        @close="closeDisableConfirm"
        @confirm="confirmDisable"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted } from 'vue'
  import { useUserStore } from '@/entities/user'
  import { usePermissions, useWorkspaceStore, workspaceService } from '@/entities/workspace'
  import { modules } from '@/app/modules/config'
  import { Card, Button, Modal, ConfirmModal } from '@/shared/ui'
  import type { Module } from '@/app/modules/config'

  const workspaceStore = useWorkspaceStore()
  const { isOwner, isAdmin } = usePermissions()
  const userStore = useUserStore()

  onMounted(() => {
    workspaceStore.loadLicenses()
  })

  const activatingModule = ref<string | null>(null)
  const disablingModule = ref<string | null>(null)
  const showDisableModal = ref(false)
  const disableTarget = ref<Module | null>(null)

  const isGlobalAdmin = computed(
    () =>
      userStore.currentUser?.role === 'ADMIN' ||
      (typeof userStore.currentUser?.role === 'string' &&
        userStore.currentUser.role.toUpperCase() === 'ADMIN'),
  )

  /** Владелец/админ workspace или глобальный админ может включать/отключать модули. */
  const canActivateModules = computed(() => isOwner.value || isAdmin.value || isGlobalAdmin.value)

  /**
   * Core-модули (is_core = TRUE в БД) можно включать без лицензии.
   * Админ может включать/отключать любой модуль без лицензии.
   * Данные берём из API /workspace-modules (workspaceStore.modules), без хардкода id на фронте.
   */
  const coreModuleCodes = computed(
    () => new Set(workspaceStore.modules.filter((m) => m.isCore).map((m) => m.moduleName)),
  )

  /** Может ли пользователь включить этот модуль: админ (workspace/глобальный) — всегда; владелец — при лицензии или если модуль core. */
  const canEnableModule = (moduleId: string) =>
    canActivateModules.value &&
    (isAdmin.value ||
      isGlobalAdmin.value ||
      coreModuleCodes.value.has(moduleId) ||
      workspaceStore.licensedModuleCodesForCurrentWorkspace.has(moduleId))

  const enabledSet = computed(() => new Set(workspaceStore.enabledModules))

  const availableModules = computed(() => modules.filter((m) => enabledSet.value.has(m.id)))

  const unavailableModules = computed(() => modules.filter((m) => !enabledSet.value.has(m.id)))

  async function activateModule(moduleCode: string) {
    const ws = workspaceStore.currentWorkspace
    if (!ws) return
    activatingModule.value = moduleCode
    try {
      await workspaceService.enableModule(ws.id, moduleCode)
      await workspaceStore.loadModules(ws.id)
    } catch (e) {
      console.error('Failed to enable module:', e)
    } finally {
      activatingModule.value = null
    }
  }

  function openDisableConfirm(module: Module) {
    disableTarget.value = module
    showDisableModal.value = true
  }

  function closeDisableConfirm() {
    showDisableModal.value = false
    disableTarget.value = null
  }

  async function confirmDisable() {
    if (!disableTarget.value || !workspaceStore.currentWorkspace) return
    const { id: moduleCode } = disableTarget.value
    disablingModule.value = moduleCode
    try {
      await workspaceService.disableModule(workspaceStore.currentWorkspace.id, moduleCode)
      await workspaceStore.loadModules(workspaceStore.currentWorkspace.id)
      closeDisableConfirm()
    } catch (e) {
      console.error('Failed to disable module:', e)
    } finally {
      disablingModule.value = null
    }
  }
</script>
