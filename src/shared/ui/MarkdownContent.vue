<template>
  <div
    class="MarkdownContent prose prose-sm max-w-none text-text-primary prose-headings:text-text-primary prose-p:text-text-primary prose-li:text-text-primary prose-code:text-text-primary prose-code:bg-bg-tertiary prose-code:px-1 prose-code:rounded"
    v-html="html"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { marked } from 'marked'
  import DOMPurify from 'dompurify'

  const props = defineProps<{
    content: string
  }>()

  const html = computed(() => {
    if (!props.content?.trim()) return ''
    try {
      const raw = marked.parse(props.content, { async: false }) as string
      return DOMPurify.sanitize(raw, {
        ALLOWED_TAGS: [
          'p',
          'br',
          'strong',
          'em',
          'ul',
          'ol',
          'li',
          'h1',
          'h2',
          'h3',
          'code',
          'pre',
          'a',
          'blockquote',
        ],
      })
    } catch {
      return DOMPurify.sanitize(props.content.replace(/\n/g, '<br>'))
    }
  })
</script>
