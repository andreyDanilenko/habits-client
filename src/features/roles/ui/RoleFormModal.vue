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
  import { Modal, ModalContent, Button, Input, Textarea } from '@/shared/ui'
  import { useRoleEditor } from '../model/use-role-editor'
  import PermissionTree from '@/features/permissions/ui/PermissionTree.vue'
  import type { Role, PermissionString } from '@/entities/role'

  const props = defineProps<{
    modelValue: boolean
    role?: Role | null
    initialPermissions?: PermissionString[]
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'saved', role: unknown): void
  }>()

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
      emit('saved', result)
      internalOpen.value = false
    } finally {
      isSaving.value = false
    }
  }
</script>
