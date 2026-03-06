<template>
  <div v-if="hasModules" class="space-y-(--spacing-4)">
    <div
      v-for="module in Object.values(tree.modules)"
      :key="module.code"
      class="border border-border-default rounded-(--radius-md) p-(--spacing-3)"
    >
      <div class="font-semibold mb-(--spacing-2) text-text-primary">
        {{ module.name }}
      </div>
      <div class="space-y-(--spacing-2)">
        <div v-for="entity in Object.values(module.entities)" :key="entity.code" class="pl-(--spacing-3)">
          <div class="font-medium text-(--text-sm) mb-(--spacing-1) text-text-secondary">
            {{ entity.name }}
          </div>
          <div class="pl-(--spacing-3) space-y-(--spacing-1)">
            <Checkbox
              v-for="action in Object.values(entity.actions)"
              :key="action.code"
              :model-value="isChecked(action.permissionString)"
              :label="action.name"
              container-class="items-center"
              @update:model-value="(v) => onToggle(action.permissionString, v)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-(--text-sm) text-text-muted">Нет доступных прав для этого workspace.</div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Checkbox } from '@/shared/ui'
  import { usePermissionTree } from '../model/use-permission-tree'
  import type { PermissionString } from '@/entities/role'

  const props = defineProps<{
    modelValue: PermissionString[]
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: PermissionString[]): void
  }>()

  const { tree } = usePermissionTree()

  const hasModules = computed(() => Object.keys(tree.value.modules ?? {}).length > 0)

  const modelValueSet = computed(() => new Set(props.modelValue ?? []))

  const isChecked = (permissionString: string) => modelValueSet.value.has(permissionString as PermissionString)

  const onToggle = (value: string, checked: boolean) => {
    const next = new Set(modelValueSet.value)
    if (checked) {
      next.add(value as PermissionString)
    } else {
      next.delete(value as PermissionString)
    }
    emit('update:modelValue', Array.from(next) as PermissionString[])
  }
</script>
