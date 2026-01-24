<template>
  <FormField label="Содержание" required>
    <!-- Markdown редактор -->
    <div v-if="contentType === 'markdown'" class="space-y-4">
      <textarea
        ref="textareaRef"
        :value="content"
        @input="handleInput"
        rows="15"
        placeholder="Начните писать в формате Markdown..."
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm"
      />
      <div class="border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-auto max-h-[400px]">
        <div class="prose prose-sm max-w-none markdown-content" v-html="renderedMarkdown" />
      </div>
    </div>

    <!-- Текстовый редактор -->
    <textarea
      v-else
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
  import { ref, computed } from 'vue'
  import { FormField } from '@/shared/ui'
  import { marked } from 'marked'
  import DOMPurify from 'dompurify'
  import type { JournalContentType } from '@/entities/journal'

  interface Props {
    contentType: JournalContentType
    content: string
  }

  interface Emits {
    (e: 'update:content', value: string): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const textareaRef = ref<HTMLTextAreaElement | null>(null)

  marked.setOptions({
    gfm: true,
    breaks: true,
  })

  const renderedMarkdown = computed(() => {
    if (props.contentType === 'markdown' && props.content) {
      try {
        const rawHtml = marked(props.content) as string
        return DOMPurify.sanitize(rawHtml)
      } catch (error) {
        console.error('Markdown rendering error:', error)
        return ''
      }
    }
    return ''
  })

  const handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement
    emit('update:content', target.value)
  }

  defineExpose({
    textareaRef,
  })
</script>

<style scoped>
  .markdown-content :deep(h1) {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    margin-top: 1.5rem;
  }
  .markdown-content :deep(h2) {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    margin-top: 1.25rem;
  }
  .markdown-content :deep(h3) {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    margin-top: 1rem;
  }
  .markdown-content :deep(ul),
  .markdown-content :deep(ol) {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }
  .markdown-content :deep(li) {
    margin-top: 0.25rem;
  }
  .markdown-content :deep(p) {
    margin-bottom: 1rem;
  }
  .markdown-content :deep(strong) {
    font-weight: 600;
  }
  .markdown-content :deep(em) {
    font-style: italic;
  }
  .markdown-content :deep(code) {
    background-color: #f3f4f6;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: monospace;
    font-size: 0.875em;
  }
  .markdown-content :deep(pre) {
    background-color: #1f2937;
    color: #f9fafb;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin-bottom: 1rem;
  }
  .markdown-content :deep(pre code) {
    background-color: transparent;
    color: inherit;
    padding: 0;
  }
</style>
