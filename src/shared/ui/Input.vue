<template>
  <div>
    <label v-if="label" :for="id || name" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <input
      :id="id || name"
      v-model="modelValue"
      :type="type"
      :required="required"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors',
        inputClasses,
        {
          'border-gray-300 focus:ring-indigo-500 focus:border-transparent': !error && !disabled,
          'border-red-300 focus:ring-red-500 focus:border-transparent': error && !disabled,
          'bg-gray-100 cursor-not-allowed': disabled,
        },
      ]"
      v-bind="$attrs"
    />

    <p v-if="error || hint" :class="['mt-1 text-sm', error ? 'text-red-600' : 'text-gray-500']">
      {{ error || hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    modelValue: string
    label?: string
    type?: string
    name?: string
    id?: string
    required?: boolean
    placeholder?: string
    disabled?: boolean
    error?: string
    hint?: string
    inputClasses?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    required: false,
    disabled: false,
    inputClasses: '',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const modelValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  })
</script>
