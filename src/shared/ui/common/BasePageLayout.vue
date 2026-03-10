<template>
  <div class="mx-auto space-y-(--spacing-6) pb-(--spacing-8)">
    <div class="flex items-start justify-between gap-(--spacing-4)">
      <div class="flex-1">
        <slot name="header-title">
          <h1 class="text-text-primary">{{ title }}</h1>
          <p v-if="description" class="mt-(--spacing-1) text-(--text-sm) text-text-secondary">
            {{ description }}
          </p>
        </slot>
      </div>

      <div class="flex items-center gap-(--spacing-3)">
        <slot name="header-actions"></slot>
      </div>
    </div>

    <slot name="error">
      <div
        v-if="errorMessage"
        class="p-(--spacing-3) rounded-(--radius-md) bg-error-light text-error-dark text-(--text-sm)"
      >
        {{ errorMessage }}
      </div>
    </slot>

    <div
      v-if="$slots.sidebar"
      class="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.8fr)] gap-(--spacing-6)"
    >
      <div class="h-full">
        <slot name="sidebar"></slot>
      </div>
      <div class="h-full">
        <slot name="content"></slot>
      </div>
    </div>
    <div v-else class="h-full">
      <slot name="content"></slot>
    </div>

    <slot name="modals"></slot>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    title?: string
    description?: string
    errorMessage?: string | null
  }>()
</script>
