<template>
  <div
    class="RichContentDisplay text-(--text-sm) text-text-primary break-words"
    v-html="sanitizedHtml"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import DOMPurify from 'dompurify'
  import { normalizeContentForDisplay } from '@/shared/lib/rich-content'

  const props = defineProps<{
    content: string
  }>()

  const sanitizedHtml = computed(() => {
    const normalized = normalizeContentForDisplay(props.content ?? '')
    if (!normalized.trim()) return ''
    return DOMPurify.sanitize(normalized, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'u',
        's',
        'ul',
        'ol',
        'li',
        'a',
        'blockquote',
        'code',
        'pre',
        'h1',
        'h2',
        'h3',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    })
  })
</script>

<style scoped>
  /* Стили как в Quill — форматирование отображается так же, как при создании */
  .RichContentDisplay :deep(p) {
    margin: 0 0 0.5em;
  }

  .RichContentDisplay :deep(p:last-child) {
    margin-bottom: 0;
  }

  .RichContentDisplay :deep(strong) {
    font-weight: 600;
  }

  .RichContentDisplay :deep(em) {
    font-style: italic;
  }

  .RichContentDisplay :deep(u) {
    text-decoration: underline;
  }

  .RichContentDisplay :deep(s) {
    text-decoration: line-through;
  }

  .RichContentDisplay :deep(ul) {
    list-style-type: disc;
    margin: 0.5em 0;
    padding-left: 1.5em;
  }

  .RichContentDisplay :deep(ol) {
    list-style-type: decimal;
    margin: 0.5em 0;
    padding-left: 1.5em;
  }

  .RichContentDisplay :deep(li) {
    margin: 0.25em 0;
  }

  .RichContentDisplay :deep(a) {
    color: var(--color-primary-default);
    text-decoration: underline;
  }

  .RichContentDisplay :deep(a:hover) {
    text-decoration: none;
  }

  .RichContentDisplay :deep(blockquote) {
    border-left: 4px solid var(--color-border-default);
    margin: 0.5em 0;
    padding-left: 1em;
    color: var(--color-text-secondary);
  }

  .RichContentDisplay :deep(code) {
    background: var(--color-bg-tertiary);
    padding: 0.125em 0.375em;
    border-radius: 0.25em;
    font-size: 0.9em;
  }

  .RichContentDisplay :deep(pre) {
    background: var(--color-bg-tertiary);
    padding: 0.75em 1em;
    border-radius: 0.25em;
    font-size: 0.9em;
    overflow-x: auto;
    margin: 0.5em 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .RichContentDisplay :deep(pre code) {
    background: none;
    padding: 0;
  }

  .RichContentDisplay :deep(h1),
  .RichContentDisplay :deep(h2),
  .RichContentDisplay :deep(h3) {
    margin: 0.5em 0 0.25em;
    font-weight: 600;
    line-height: 1.3;
  }

  .RichContentDisplay :deep(h1) {
    font-size: 1.25em;
  }

  .RichContentDisplay :deep(h2) {
    font-size: 1.1em;
  }

  .RichContentDisplay :deep(h3) {
    font-size: 1em;
  }
</style>
