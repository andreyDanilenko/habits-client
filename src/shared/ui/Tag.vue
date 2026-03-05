<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-tertiary text-sm text-text-primary"
  >
    <slot>
      {{ label }}
    </slot>

    <button
      v-if="removable"
      type="button"
      class="p-0.5 rounded hover:bg-border-light text-text-muted hover:text-text-primary"
      :aria-label="removeAriaLabel"
      @click="$emit('remove')"
    >
      <XMarkIcon class="size-3.5" />
    </button>
  </span>
</template>

<script setup lang="ts">
  import { XMarkIcon } from './icon'

  interface Props {
    label?: string
    removable?: boolean
    removeAriaLabel?: string
  }

  withDefaults(defineProps<Props>(), {
    label: '',
    removable: false,
    removeAriaLabel: 'Удалить',
  })

  defineEmits<{
    remove: []
  }>()
</script>
