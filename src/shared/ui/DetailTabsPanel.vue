<template>
  <div
    class="rounded-(--radius-lg) border border-border-default bg-bg-primary overflow-hidden flex flex-col max-h-[calc(100vh-10rem)]"
  >
    <nav class="flex shrink-0 border-b border-border-light overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="[
          'px-(--spacing-4) py-(--spacing-3) text-(--text-sm) font-medium border-b-2 -mb-px transition-colors shrink-0',
          modelValue === tab.id
            ? 'border-primary-default text-primary-default'
            : 'border-transparent text-text-secondary hover:text-text-primary',
        ]"
        @click="$emit('update:modelValue', tab.id)"
      >
        {{ tab.label }}
      </button>
    </nav>
    <div class="p-(--spacing-6) flex-1 min-h-0 overflow-y-auto">
      <component
        v-if="tabComponents?.[modelValue]"
        :is="tabComponents[modelValue]"
        v-bind="(tabProps ?? {})[modelValue] ?? {}"
      />
      <template v-else>
        <template v-for="tab in tabs" :key="tab.id">
          <slot v-if="modelValue === tab.id" :name="tab.id" />
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Component } from 'vue'

  defineProps<{
    modelValue: string
    tabs: { id: string; label: string }[]
    tabComponents?: Record<string, Component>
    tabProps?: Record<string, Record<string, unknown>>
  }>()

  defineEmits<{
    'update:modelValue': [value: string]
  }>()
</script>
