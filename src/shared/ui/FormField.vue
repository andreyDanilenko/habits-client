<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-text-secondary mb-1">
      {{ label }}
      <span v-if="required" class="text-error-default">*</span>
    </label>
    <slot />
    <div v-if="showCharCount || hint" class="mt-1 flex justify-between">
      <p v-if="hint" class="text-xs text-text-muted">{{ hint }}</p>
      <p v-if="showCharCount" class="text-xs text-text-muted">
        {{ currentLength }}/{{ maxLength }} символов
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    label?: string
    required?: boolean
    hint?: string
    showCharCount?: boolean
    currentLength?: number
    maxLength?: number
  }>()
</script>
