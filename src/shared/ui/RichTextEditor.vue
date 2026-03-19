<template>
  <div class="RichTextEditor" :class="{ 'RichTextEditor--compact': compact }">
    <QuillEditor
      v-model:content="contentRef"
      content-type="html"
      :theme="theme"
      :placeholder="placeholder"
      :read-only="readOnly"
      :toolbar="toolbarConfig"
      :modules="slashCommandsModules"
      class="RichTextEditor__quill"
      @update:content="emitUpdate"
      @text-change="emitUpdate"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { QuillEditor } from '@vueup/vue-quill'
  import { SlashCommandsModule } from '@/shared/lib/quill-slash-commands'

  const props = withDefaults(
    defineProps<{
      modelValue?: string
      placeholder?: string
      readOnly?: boolean
      compact?: boolean
      theme?: 'snow' | 'bubble'
    }>(),
    { theme: 'snow', compact: false },
  )

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const contentRef = ref<string>(props.modelValue ?? '')

  watch(
    () => props.modelValue,
    (v) => {
      const next = v ?? ''
      if (next !== contentRef.value) contentRef.value = next
    },
    { immediate: true },
  )

  const toolbarConfig = computed(() =>
    props.compact
      ? [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic'],
          ['link'],
          [{ list: 'ordered' }, { list: 'bullet' }],
        ]
      : [
          ['bold', 'italic', 'underline', 'strike'],
          [{ header: [1, 2, 3, false] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'blockquote', 'code-block'],
          ['clean'],
        ],
  )

  const slashCommandsModules = [
    { name: 'slashCommands', module: SlashCommandsModule, options: {} },
  ]

  function emitUpdate() {
    const val = typeof contentRef.value === 'string' ? contentRef.value : ''
    emit('update:modelValue', val)
  }
</script>

<style scoped>
  .RichTextEditor :deep(.ql-container) {
    font-size: var(--text-sm);
    min-height: 120px;
  }

  .RichTextEditor--compact :deep(.ql-container) {
    min-height: 80px;
  }

  .RichTextEditor :deep(.ql-editor) {
    color: var(--color-text-primary);
  }

  .RichTextEditor :deep(.ql-toolbar) {
    border-color: var(--color-border-default);
    background: var(--color-bg-tertiary);
  }

  .RichTextEditor :deep(.ql-container) {
    border-color: var(--color-border-default);
  }

  .RichTextEditor :deep(.ql-editor.ql-blank::before) {
    color: var(--color-text-muted);
    font-style: normal;
  }

  /* Slash commands menu */
  .RichTextEditor :deep(.ql-slash-menu) {
    position: absolute;
    z-index: 50;
    min-width: 200px;
    max-height: 280px;
    overflow-y: auto;
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    padding: var(--spacing-1);
  }

  .RichTextEditor :deep(.ql-slash-menu--hidden) {
    display: none;
  }

  .RichTextEditor :deep(.ql-slash-menu__item) {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--text-sm);
    color: var(--color-text-primary);
    cursor: pointer;
    border-radius: var(--radius-sm);
  }

  .RichTextEditor :deep(.ql-slash-menu__item:hover),
  .RichTextEditor :deep(.ql-slash-menu__item--selected) {
    background: var(--color-bg-tertiary);
  }

  .RichTextEditor :deep(.ql-slash-menu__icon) {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    min-width: 1.5em;
  }
</style>
