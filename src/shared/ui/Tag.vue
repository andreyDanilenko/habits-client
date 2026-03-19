<template>
  <span
    class="inline-flex items-center gap-1 rounded-full bg-bg-tertiary text-text-primary"
    :class="sizeClasses"
  >
    <slot>
      {{ label }}
    </slot>

    <button
      v-if="removable"
      type="button"
      class="p-0.5 -mr-0.5 rounded hover:bg-border-light text-text-muted hover:text-text-primary hover:text-error-default leading-none"
      :aria-label="removeAriaLabel"
      @click="$emit('remove')"
    >
      <XMarkIcon :class="size === 'sm' ? 'size-3' : 'size-3.5'" />
    </button>
  </span>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { XMarkIcon } from './icon'

  interface Props {
    label?: string
    removable?: boolean
    removeAriaLabel?: string
    size?: 'sm' | 'md'
  }

  const props = withDefaults(defineProps<Props>(), {
    label: '',
    removable: false,
    removeAriaLabel: 'Удалить',
    size: 'md',
  })

  const sizeClasses = computed(() =>
    props.size === 'sm' ? 'px-1.5 py-0.5 text-[11px] gap-0.5' : 'px-2 py-1 text-(--text-xs)',
  )

  defineEmits<{
    remove: []
  }>()
</script>
