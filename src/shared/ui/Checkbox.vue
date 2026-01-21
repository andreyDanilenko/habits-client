<template>
    <div :class="['flex', containerClass]">
      <input
        :id="id || name"
        v-model="modelValue"
        type="checkbox"
        :disabled="disabled"
        :class="[
          'rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 focus:outline-none transition-colors',
          sizeClasses,
          {
            'cursor-not-allowed opacity-50': disabled,
            'cursor-pointer': !disabled
          }
        ]"
        v-bind="$attrs"
      />
      
      <div v-if="label" class="ml-2 flex-1">
        <label
          :for="id || name"
          :class="[
            'text-gray-700 select-none',
            labelSizeClasses,
            {
              'cursor-not-allowed opacity-50': disabled,
              'cursor-pointer': !disabled
            }
          ]"
        >
          {{ label }}
          <span v-if="required" class="text-red-500 ml-1">*</span>
        </label>
        
        <p
          v-if="hint"
          :class="[
            'mt-1',
            hintSizeClasses,
            error ? 'text-red-600' : 'text-gray-500'
          ]"
        >
          {{ hint }}
        </p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
    import { computed } from 'vue'
  
    interface Props {
      modelValue: boolean
      label?: string
      name?: string
      id?: string
      required?: boolean
      disabled?: boolean
      hint?: string
      error?: boolean
      size?: 'sm' | 'md' | 'lg'
      containerClass?: string
    }
  
    const props = withDefaults(defineProps<Props>(), {
      required: false,
      disabled: false,
      size: 'md',
      error: false,
      containerClass: 'items-start'
    })
  
    const emit = defineEmits<{
      'update:modelValue': [value: boolean]
      'change': [value: boolean]
    }>()
  
    const modelValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', value)
        emit('change', value)
      }
    })
  
    // Классы в зависимости от размера
    const sizeClasses = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'h-3 w-3 mt-0.5'
        case 'lg':
          return 'h-5 w-5 mt-0.5'
        default: 
          return 'h-4 w-4 mt-0.5'
      }
    })
  
    const labelSizeClasses = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'text-xs'
        case 'lg':
          return 'text-base'
        default: 
          return 'text-sm'
      }
    })
  
    const hintSizeClasses = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'text-xs'
        case 'lg':
          return 'text-sm'
        default: 
          return 'text-xs'
      }
    })
  </script>
