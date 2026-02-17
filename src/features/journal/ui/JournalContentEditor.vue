<template>
  <FormField label="Содержание" required>
    <textarea
      ref="textareaRef"
      :value="content"
      @input="handleInput"
      rows="20"
      placeholder="Начните писать..."
      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
    />
  </FormField>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { FormField } from '@/shared/ui'

  interface Props {
    content: string
  }

  interface Emits {
    (e: 'update:content', value: string): void
  }

  defineProps<Props>()
  const emit = defineEmits<Emits>()

  const textareaRef = ref<HTMLTextAreaElement | null>(null)

  const handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement
    emit('update:content', target.value)
  }

  defineExpose({
    textareaRef,
  })
</script>
