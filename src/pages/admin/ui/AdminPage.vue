<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-semibold text-text-primary">Админ-панель</h1>
      <p class="mt-2 text-text-secondary">
        Список пользователей. Бан, деактивация, выдача лицензий, жёсткое удаление.
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
            <div v-if="user.workspaces?.length && user.status === 'ACTIVE'" class="mt-2">
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    class="!p-0.5 !min-w-0 h-5 text-xs"
                    title="Модули и триал"
                    @click="openWorkspaceModulesModal(ws)"
                  >
                    Модули
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
                title="Управление лицензиями"
                @click="openLicenseModal(user)"
              >
                Лицензии
              </Button>
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
      @update:is-open="
        (v) => {
          showDeleteModal = v
          if (!v) closeDeleteConfirm()
        }
      "
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
            <span v-if="deleteTarget.name" class="text-text-secondary">
              — {{ deleteTarget.name }}</span
            >
          </p>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <Button type="button" variant="outline" @click="closeDeleteConfirm"> Отмена </Button>
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

    <!-- Модалка лицензий -->
    <Modal
      :is-open="showLicenseModal"
      @update:is-open="
        (v) => {
          showLicenseModal = v
          if (!v) closeLicenseModal()
        }
      "
    >
      <ModalContent
        :title="
          licenseTarget ? `Лицензии: ${licenseTarget.name || licenseTarget.email}` : 'Лицензии'
        "
        @close="closeLicenseModal"
      >
        <template #default>
          <div v-if="licenseTarget" class="space-y-4">
            <!-- Текущие лицензии -->
            <div>
              <h3 class="text-sm font-medium text-text-primary mb-2">Текущие лицензии</h3>
              <div v-if="licenseLoading" class="py-4 flex justify-center">
                <Spinner />
              </div>
              <div v-else-if="userLicenses.length === 0" class="py-3 text-sm text-text-muted">
                Нет выданных лицензий
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="lic in userLicenses"
                  :key="lic.id"
                  class="flex items-center justify-between py-2 px-3 rounded-lg bg-bg-tertiary gap-2"
                >
                  <div>
                    <span class="font-medium text-text-primary">{{ lic.moduleCode }}</span>
                    <span class="ml-2 text-xs text-text-muted">
                      {{ lic.scope === 'all_workspaces' ? 'Все воркспейсы' : 'Один воркспейс' }}
                      <span v-if="lic.workspaceId">
                        ({{
                          licenseTarget?.workspaces?.find((w) => w.id === lic.workspaceId)?.name ||
                          lic.workspaceId
                        }})
                      </span>
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Badge variant="green" class="text-xs">Активна</Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      class="!p-1 !min-w-0 h-7 text-xs"
                      title="Отозвать лицензию"
                      :loading="revokingLicenseId === lic.id"
                      @click="revokeLicense(lic)"
                    >
                      Отозвать
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Выдать лицензию -->
            <div class="pt-4 border-t border-border-light">
              <h3 class="text-sm font-medium text-text-primary mb-3">Выдать лицензию</h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-text-secondary mb-1">Модуль</label>
                  <select
                    v-model="grantForm.moduleCode"
                    class="w-full px-3 py-2 rounded-lg border border-border-default bg-bg-primary text-text-primary text-sm"
                  >
                    <option value="">Выберите модуль</option>
                    <option
                      v-for="m in nonCoreModules"
                      :key="m.id"
                      :value="m.code"
                      :disabled="hasLicenseForModule(m.code)"
                    >
                      {{ m.name }} ({{ m.code }})
                      <template v-if="hasLicenseForModule(m.code)"> — уже есть</template>
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-text-secondary mb-1">Область</label>
                  <select
                    v-model="grantForm.scope"
                    class="w-full px-3 py-2 rounded-lg border border-border-default bg-bg-primary text-text-primary text-sm"
                  >
                    <option value="all_workspaces">Все воркспейсы</option>
                    <option value="single_workspace">Один воркспейс</option>
                  </select>
                </div>
                <div v-if="grantForm.scope === 'single_workspace'">
                  <label class="block text-xs font-medium text-text-secondary mb-1"
                    >Воркспейс</label
                  >
                  <select
                    v-model="grantForm.workspaceId"
                    class="w-full px-3 py-2 rounded-lg border border-border-default bg-bg-primary text-text-primary text-sm"
                  >
                    <option value="">Выберите воркспейс</option>
                    <option v-for="ws in licenseTarget.workspaces" :key="ws.id" :value="ws.id">
                      {{ ws.name }}
                    </option>
                  </select>
                  <p v-if="!licenseTarget.workspaces?.length" class="mt-1 text-xs text-text-muted">
                    У пользователя нет воркспейсов. Сначала добавьте его в воркспейс.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <Button type="button" variant="outline" @click="closeLicenseModal"> Закрыть </Button>
            <Button
              type="button"
              variant="primary"
              :loading="isGranting"
              :disabled="!canGrant"
              @click="confirmGrantLicense"
            >
              Выдать лицензию
            </Button>
          </div>
        </template>
      </ModalContent>
    </Modal>

    <!-- Модалка модулей workspace (триал / full) -->
    <Modal
      :is-open="showWorkspaceModulesModal"
      @update:is-open="
        (v) => {
          showWorkspaceModulesModal = v
          if (!v) closeWorkspaceModulesModal()
        }
      "
    >
      <ModalContent
        :title="wsModulesTarget ? `Модули: ${wsModulesTarget.name}` : 'Модули'"
        @close="closeWorkspaceModulesModal"
      >
        <template #default>
          <div v-if="wsModulesTarget" class="space-y-3">
            <div v-if="wsModulesLoading" class="py-4 flex justify-center">
              <Spinner />
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="m in wsModules"
                :key="m.moduleName"
                class="flex items-center justify-between py-2 px-3 rounded-lg bg-bg-tertiary gap-2"
              >
                <div>
                  <span class="font-medium text-text-primary">{{ m.moduleName }}</span>
                  <span v-if="m.isCore" class="ml-2 text-xs text-text-muted"
                    >(всегда бесплатен)</span
                  >
                  <span v-else-if="m.status === 'trial'" class="ml-2 text-xs text-warning-default">
                    Триал до {{ m.expiresAt ? formatDate(m.expiresAt) : '—' }}
                  </span>
                  <span v-else-if="m.status === 'active'" class="ml-2 text-xs text-success-default">
                    Полная лицензия
                  </span>
                  <span v-else class="ml-2 text-xs text-text-muted">Отключён</span>
                </div>
                <div v-if="!m.isCore" class="flex gap-1">
                  <Button
                    v-if="m.status === 'trial' || m.status === 'disabled'"
                    type="button"
                    variant="outline"
                    size="md"
                    class="!p-1 !min-w-0 h-7 text-xs"
                    :loading="patchingModule === m.moduleName"
                    @click="patchModule(m, 'extend_trial', 30)"
                  >
                    +30 дн
                  </Button>
                  <Button
                    v-if="m.status === 'disabled'"
                    type="button"
                    variant="outline"
                    size="md"
                    class="!p-1 !min-w-0 h-7 text-xs"
                    :loading="patchingModule === m.moduleName"
                    @click="patchModule(m, 'add_trial', 30)"
                  >
                    Триал
                  </Button>
                  <Button
                    v-if="m.status === 'trial' || m.status === 'active'"
                    type="button"
                    variant="primary"
                    size="md"
                    class="!p-1 !min-w-0 h-7 text-xs"
                    :loading="patchingModule === m.moduleName"
                    @click="patchModule(m, 'set_full')"
                  >
                    Full
                  </Button>
                  <Button
                    v-if="m.status === 'trial' || m.status === 'active'"
                    type="button"
                    variant="outline"
                    size="md"
                    class="!p-1 !min-w-0 h-7 text-xs text-danger-default border-danger-default/50 hover:bg-danger-default/10"
                    :loading="patchingModule === m.moduleName"
                    title="Отключить модуль в этом workspace"
                    @click="patchModule(m, 'set_disabled')"
                  >
                    Отключить
                  </Button>
                </div>
              </div>
            </div>
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
  import {
    adminService,
    type AdminUserWithWorkspaces,
    type AdminModule,
    type AdminWorkspace,
    type UserModuleLicense,
    type WorkspaceModuleInfo,
  } from '@/features/admin'
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

  // Лицензии
  const showLicenseModal = ref(false)
  const licenseTarget = ref<AdminUserWithWorkspaces | null>(null)
  const userLicenses = ref<UserModuleLicense[]>([])
  const licenseLoading = ref(false)
  const allModules = ref<AdminModule[]>([])
  const isGranting = ref(false)
  const revokingLicenseId = ref<string | null>(null)
  const showWorkspaceModulesModal = ref(false)
  const wsModulesTarget = ref<AdminWorkspace | null>(null)
  const wsModules = ref<WorkspaceModuleInfo[]>([])
  const wsModulesLoading = ref(false)
  const patchingModule = ref<string | null>(null)
  const grantForm = ref({
    moduleCode: '',
    scope: 'all_workspaces' as 'all_workspaces' | 'single_workspace',
    workspaceId: '',
  })

  const nonCoreModules = computed(() => allModules.value.filter((m) => !m.isCore))
  const hasLicenseForModule = (code: string) =>
    userLicenses.value.some((l) => l.moduleCode === code && l.scope === 'all_workspaces')
  const canGrant = computed(() => {
    if (!grantForm.value.moduleCode) return false
    if (grantForm.value.scope === 'single_workspace') {
      return !!grantForm.value.workspaceId
    }
    return true
  })

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

  const openLicenseModal = async (user: AdminUserWithWorkspaces) => {
    licenseTarget.value = user
    grantForm.value = { moduleCode: '', scope: 'all_workspaces', workspaceId: '' }
    showLicenseModal.value = true
    licenseLoading.value = true
    userLicenses.value = []
    try {
      const [licenses, modules] = await Promise.all([
        adminService.getUserLicenses(user.id),
        adminService.getModules(),
      ])
      userLicenses.value = Array.isArray(licenses) ? licenses : []
      allModules.value = modules ?? []
    } catch (e: any) {
      if (e?.response?.status === 403) {
        error.value = 'Доступ запрещён.'
      } else {
        error.value = 'Не удалось загрузить лицензии.'
      }
    } finally {
      licenseLoading.value = false
    }
  }

  const closeLicenseModal = () => {
    showLicenseModal.value = false
    licenseTarget.value = null
    userLicenses.value = []
  }

  const confirmGrantLicense = async () => {
    if (!licenseTarget.value || !canGrant.value) return
    isGranting.value = true
    try {
      await adminService.grantLicense(licenseTarget.value.id, {
        moduleCode: grantForm.value.moduleCode,
        scope: grantForm.value.scope,
        workspaceId:
          grantForm.value.scope === 'single_workspace' && grantForm.value.workspaceId
            ? grantForm.value.workspaceId
            : undefined,
      })
      userLicenses.value = await adminService.getUserLicenses(licenseTarget.value.id)
      grantForm.value = { moduleCode: '', scope: 'all_workspaces', workspaceId: '' }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message
      error.value = msg || 'Не удалось выдать лицензию.'
    } finally {
      isGranting.value = false
    }
  }

  const revokeLicense = async (lic: UserModuleLicense) => {
    if (!licenseTarget.value) return
    revokingLicenseId.value = lic.id
    try {
      await adminService.revokeLicense(licenseTarget.value.id, lic.id)
      userLicenses.value = await adminService.getUserLicenses(licenseTarget.value.id)
    } catch (e: any) {
      if (e?.response?.status === 403) {
        error.value = 'Доступ запрещён.'
      } else {
        error.value = 'Не удалось отозвать лицензию.'
      }
    } finally {
      revokingLicenseId.value = null
    }
  }

  const openWorkspaceModulesModal = async (ws: AdminWorkspace) => {
    wsModulesTarget.value = ws
    wsModulesLoading.value = true
    wsModules.value = []
    try {
      wsModules.value = await adminService.getWorkspaceModules(ws.id)
    } catch (e: any) {
      error.value = e?.response?.data?.message || 'Не удалось загрузить модули.'
    } finally {
      wsModulesLoading.value = false
    }
    showWorkspaceModulesModal.value = true
  }

  const closeWorkspaceModulesModal = () => {
    showWorkspaceModulesModal.value = false
    wsModulesTarget.value = null
    wsModules.value = []
  }

  const formatDate = (s: string) => {
    try {
      const d = new Date(s)
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return s
    }
  }

  const patchModule = async (
    m: WorkspaceModuleInfo,
    action: 'extend_trial' | 'add_trial' | 'set_full' | 'set_disabled',
    trialDays?: number,
  ) => {
    if (!wsModulesTarget.value) return
    patchingModule.value = m.moduleName
    try {
      await adminService.patchWorkspaceModule(wsModulesTarget.value.id, m.moduleName, {
        action,
        trialDays,
      })
      wsModules.value = await adminService.getWorkspaceModules(wsModulesTarget.value.id)
    } catch (e: any) {
      error.value = e?.response?.data?.message || 'Не удалось обновить модуль.'
    } finally {
      patchingModule.value = null
    }
  }

  onMounted(() => {
    fetchUsers()
  })
</script>
