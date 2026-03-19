<template>
  <li
    class="ChecklistItem flex items-center gap-(--spacing-2) group"
    :class="{ 'cursor-pointer': canEdit }"
    @click="canEdit ? $emit('toggle') : undefined"
  >
    <div v-if="canEdit" class="pointer-events-none shrink-0">
      <Checkbox
        :model-value="done"
        size="xs"
        container-class="items-center"
      />
    </div>
    <span
      v-else
      class="shrink-0 w-3.5 h-3.5 flex items-center justify-center text-(--text-xs)"
      :class="done ? 'text-success-default' : 'text-text-muted'"
    >
      {{ done ? '✓' : '○' }}
    </span>
    <span
      class="flex-1 text-(--text-xs)"
      :class="done ? 'line-through text-text-muted' : 'text-text-primary'"
    >
      {{ text }}
    </span>
    <Button
      v-if="canEdit"
      variant="icon"
      size="xs"
      icon-color="danger"
      :left-icon="XMarkIcon"
      icon-only
      custom-class="ChecklistItem__Remove shrink-0 opacity-0"
      aria-label="Удалить"
      @click.stop="$emit('remove')"
    />
  </li>
</template>

<script setup lang="ts">
  import Checkbox from './Checkbox.vue'
  import Button from './Button.vue'
  import { XMarkIcon } from './icon'

  defineProps<{
    done: boolean
    text: string
    canEdit?: boolean
  }>()

  defineEmits<{
    toggle: []
    remove: []
  }>()
</script>

<style scoped>
  @media (hover: hover) {
    .group:hover .ChecklistItem__Remove {
      opacity: 1;
    }
  }
  @media (hover: none) {
    .ChecklistItem__Remove {
      opacity: 1;
    }
  }
</style>
