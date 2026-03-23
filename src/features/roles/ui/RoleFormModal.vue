<template>
  <Modal :is-open="internalOpen" @update:isOpen="onModalUpdate">
    <ModalContent :title="title" :description="descriptionText" @close="handleClose">
      <div class="space-y-(--spacing-4)">
        <Input v-model="name" label="Название роли" placeholder="Например, Менеджер по продажам" />
        <Textarea
          v-model="descriptionText"
          label="Описание"
          :rows="2"
          placeholder="Кратко опишите назначение роли"
        />

        <div>
          <div class="flex items-center justify-between mb-(--spacing-2)">
            <span class="text-(--text-sm) font-medium text-text-secondary">Права роли</span>
          </div>
          <PermissionTree
            :model-value="permissions"
            :is-system="props.role?.isSystem"
            @update:model-value="onPermissionsChange"
          />
        </div>

        <div class="border-t border-border-light pt-(--spacing-4) space-y-3">
          <div>
            <span class="text-(--text-sm) font-medium text-text-secondary">Видимость данных (списки)</span>
            <p class="mt-1 text-xs text-text-muted leading-relaxed">
              Отдельно от галочек прав: здесь задаётся, какие <strong>строки</strong> попадут в списки (например,
              только «свои» сделки). Права отвечают на вопрос «можно ли действие», видимость — «какой срез
              данных». Сейчас фильтрация на API включена для <strong>сделок</strong>; для контактов и компаний
              значения сохраняются и будут подключены позже.
            </p>
          </div>
          <div
            v-if="isOwnerSystemRole"
            class="rounded-lg bg-bg-tertiary px-3 py-2 text-sm text-text-secondary"
          >
            Роль <strong>OWNER</strong> всегда имеет полный доступ к данным в workspace; ограничения видимости к
            ней не применяются и не настраиваются (в том числе нельзя случайно «закрыть» себе доступ).
          </div>
          <div v-else class="space-y-3">
            <div v-for="row in objectScopeRows" :key="row.objectKey" class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span class="text-sm text-text-primary sm:w-40 flex-shrink-0">{{ row.label }}</span>
              <Select
                class="flex-1 min-w-0"
                size="md"
                :model-value="objectScopes[row.objectKey] ?? 'all'"
                :options="dataScopeOptions"
                :disabled="isSaving"
                @update:model-value="(v) => setObjectScope(row.objectKey, v)"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-(--spacing-2)">
          <Button variant="secondary" @click="handleClose"> Отмена </Button>
          <Button :disabled="!isValid" :loading="isSaving" @click="handleSave"> Сохранить </Button>
        </div>
      </template>
    </ModalContent>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { Modal, ModalContent, Button, Input, Textarea, Select } from '@/shared/ui'
  import { useRoleEditor } from '../model/use-role-editor'
  import PermissionTree from '@/features/permissions/ui/PermissionTree.vue'
  import { roleService, type Role, type PermissionString } from '@/entities/role'
  import { useWorkspaceStore } from '@/entities/workspace'

  const props = defineProps<{
    modelValue: boolean
    role?: Role | null
    initialPermissions?: PermissionString[]
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'saved', role: unknown): void
  }>()

  const objectScopeRows = [
    { objectKey: 'crm:deal', label: 'Сделки CRM' },
    { objectKey: 'crm:contact', label: 'Контакты CRM' },
    { objectKey: 'crm:company', label: 'Компании CRM' },
  ] as const

  const dataScopeOptions = [
    { value: 'all', label: 'Все записи в workspace' },
    { value: 'department', label: 'Отдел (общий department_id)' },
    { value: 'owner', label: 'Только свои записи' },
    { value: 'none', label: 'Нет доступа к списку' },
  ]

  const workspaceStore = useWorkspaceStore()
  const objectScopes = ref<Record<string, string>>({})

  const isOwnerSystemRole = computed(
    () => !!(props.role?.isSystem && props.role.name?.toUpperCase() === 'OWNER'),
  )

  function defaultObjectScopes(): Record<string, string> {
    const m: Record<string, string> = {}
    for (const row of objectScopeRows) {
      m[row.objectKey] = 'all'
    }
    return m
  }

  function setObjectScope(key: string, value: string | number | null | undefined) {
    objectScopes.value = { ...objectScopes.value, [key]: String(value ?? 'all') }
  }

  async function loadObjectScopes() {
    if (isOwnerSystemRole.value) {
      objectScopes.value = defaultObjectScopes()
      return
    }
    const wsId = props.role?.workspaceId ?? workspaceStore.currentWorkspace?.id ?? ''
    if (!wsId || !props.role?.id) {
      objectScopes.value = defaultObjectScopes()
      return
    }
    try {
      const fromApi = await roleService.getObjectScopes(wsId, props.role.id)
      objectScopes.value = { ...defaultObjectScopes(), ...fromApi }
    } catch {
      objectScopes.value = defaultObjectScopes()
    }
  }

  const internalOpen = ref(props.modelValue)

  watch(
    () => props.modelValue,
    (v) => {
      internalOpen.value = v
    },
  )

  watch(
    () => internalOpen.value,
    (v) => {
      emit('update:modelValue', v)
    },
  )

  const { name, description, permissions, isValid, setPermissions, save } = useRoleEditor({
    role: () => props.role ?? null,
    initialPermissions: props.initialPermissions,
  })

  const isSaving = ref(false)

  const title = computed(() => (props.role ? 'Редактирование роли' : 'Создание роли'))
  const descriptionText = computed({
    get: () => description.value ?? '',
    set: (v: string) => {
      description.value = v || null
    },
  })

  // При открытии модалки один раз подставляем актуальные данные роли и её права
  watch(
    () => internalOpen.value,
    (open) => {
      if (!open) return
      name.value = props.role?.name ?? ''
      description.value = props.role?.description ?? null
      setPermissions((props.initialPermissions ?? []) as PermissionString[])
      void loadObjectScopes()
    },
  )

  const handleClose = () => {
    internalOpen.value = false
  }

  const onModalUpdate = (v: boolean) => {
    internalOpen.value = v
  }

  const onPermissionsChange = (next: string[]) => {
    // Приводим к PermissionString[], так как PermissionTree оперирует строками
    setPermissions(next as PermissionString[])
  }

  const handleSave = async () => {
    if (!isValid.value || isSaving.value) return
    isSaving.value = true
    try {
      const result = await save()
      const wsId = result.workspaceId || workspaceStore.currentWorkspace?.id || ''
      if (wsId && !isOwnerSystemRole.value) {
        const payload: Record<string, string> = { ...defaultObjectScopes(), ...objectScopes.value }
        await roleService.setObjectScopes(wsId, result.id, payload)
      }
      emit('saved', result)
      internalOpen.value = false
    } finally {
      isSaving.value = false
    }
  }
</script>
