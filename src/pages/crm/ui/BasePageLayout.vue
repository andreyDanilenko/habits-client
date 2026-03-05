<template>
    <div class="max-w-7xl mx-auto space-y-6 pb-8">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <slot name="header-title">
            <h1 class="text-text-primary">{{ title }}</h1>
            <p v-if="description" class="mt-1 text-sm text-text-secondary">
              {{ description }}
            </p>
          </slot>
        </div>
        
        <div class="flex items-center gap-3">
          <slot name="header-actions"></slot>
        </div>
      </div>
  
      <slot name="error">
        <div v-if="errorMessage" class="p-3 rounded-md bg-error-light text-error-dark text-sm">
          {{ errorMessage }}
        </div>
      </slot>
  
      <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.8fr)] gap-6">
        <div v-if="$slots.sidebar" class="h-full">
          <slot name="sidebar"></slot>
        </div>
  
        <div class="h-full">
          <slot name="content"></slot>
        </div>
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
