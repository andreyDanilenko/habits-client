<template>
  <div class="rounded-(--radius-lg) border border-border-default bg-bg-primary overflow-hidden">
    <nav class="flex border-b border-border-light">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="[
          'px-(--spacing-4) py-(--spacing-3) text-(--text-sm) font-medium border-b-2 -mb-px transition-colors',
          modelValue === tab.id
            ? 'border-primary-default text-primary-default'
            : 'border-transparent text-text-secondary hover:text-text-primary',
        ]"
        @click="$emit('update:modelValue', tab.id)"
      >
        {{ tab.label }}
      </button>
    </nav>
    <div class="p-(--spacing-6)">
      <template v-for="tab in tabs" :key="tab.id">
        <slot v-if="modelValue === tab.id" :name="tab.id" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    modelValue: string
    tabs: { id: string; label: string }[]
  }>()

  defineEmits<{
    'update:modelValue': [value: string]
  }>()
</script>
