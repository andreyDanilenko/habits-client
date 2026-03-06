<template>
  <div v-if="hasModules" class="space-y-4">
    <div
      v-for="module in Object.values(tree.modules)"
      :key="module.code"
      class="border rounded-md p-3"
    >
      <div class="font-semibold mb-2">
        {{ module.name }}
      </div>
      <div class="space-y-2">
        <div v-for="entity in Object.values(module.entities)" :key="entity.code" class="pl-3">
          <div class="font-medium text-sm mb-1">
            {{ entity.name }}
          </div>
          <div class="pl-3 space-y-1">
            <label
              v-for="action in Object.values(entity.actions)"
              :key="action.code"
              class="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                :value="action.permissionString"
                :checked="modelValueSet.has(action.permissionString as PermissionString)"
                @change="onToggle(action.permissionString as PermissionString, $event)"
              />
              <span>{{ action.name }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-sm text-gray-500">Нет доступных прав для этого workspace.</div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
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

  const onToggle = (value: PermissionString, event: Event) => {
    const next = new Set(modelValueSet.value)
    const input = event.target as HTMLInputElement | null
    if (input?.checked) {
      next.add(value)
    } else {
      next.delete(value)
    }
    emit('update:modelValue', Array.from(next) as PermissionString[])
  }
</script>
