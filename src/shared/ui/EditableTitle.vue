<template>
  <div class="min-w-0">
    <input
      v-if="isEditing"
      ref="inputRef"
      type="text"
      :value="modelValue"
      class="w-full max-w-md px-(--spacing-2) py-(--spacing-1) rounded-(--radius-md) border border-border-default bg-bg-primary text-text-primary text-(--text-base) focus:outline-none focus:ring-2 focus:ring-primary-default focus:border-primary-default"
      @blur="handleSave"
      @keydown.enter="handleSave"
    />
    <span
      v-else
      class="cursor-pointer hover:underline text-text-primary"
      :class="titleClass"
      @click="isEditing = true"
    >
      {{ modelValue || placeholder }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    titleClass?: string
  }>(),
  { placeholder: '', titleClass: '' },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  save: [value: string]
}>()

const isEditing = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

watch(isEditing, async (editing) => {
  if (editing) {
    await nextTick()
    inputRef.value?.focus()
  }
})

function handleSave() {
  const value = inputRef.value?.value?.trim()
  if (value !== undefined && value !== props.modelValue) {
    emit('update:modelValue', value)
    emit('save', value)
  }
  isEditing.value = false
}
</script>
