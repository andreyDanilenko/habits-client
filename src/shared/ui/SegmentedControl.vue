<template>
  <div class="inline-flex rounded-lg border border-border-default overflow-hidden">
    <Button
      v-for="opt in options"
      :key="String(opt.value)"
      type="button"
      :variant="modelValue === opt.value ? 'primary' : 'ghost'"
      :size="size"
      :custom-class="opt.icon ? 'rounded-none flex items-center gap-1' : 'rounded-none'"
      :title="opt.label"
      @click="select(opt.value)"
    >
      <component v-if="opt.icon" :is="opt.icon" class="size-4 shrink-0 text-current" />
      {{ opt.label }}
    </Button>
  </div>
</template>

<script setup lang="ts">
  import type { Component } from 'vue'
  import Button from './Button.vue'
  import type { ComponentSize } from './Button.vue'

  export interface SegmentedOption {
    value: string
    label: string
    icon?: Component
  }

  const props = withDefaults(
    defineProps<{
      modelValue: string
      options: SegmentedOption[]
      size?: ComponentSize
    }>(),
    {
      size: 'lg',
    },
  )

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  function select(value: string) {
    if (value !== props.modelValue) {
      emit('update:modelValue', value)
    }
  }
</script>
