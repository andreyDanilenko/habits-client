<template>
  <div
    class="RichContentDisplay text-(--text-sm) text-text-primary break-words"
    v-html="sanitizedHtml"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import DOMPurify from 'dompurify'

  const props = defineProps<{
    content: string
  }>()

  const sanitizedHtml = computed(() => {
    if (!props.content?.trim()) return ''
    return DOMPurify.sanitize(props.content, {
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
</style>
