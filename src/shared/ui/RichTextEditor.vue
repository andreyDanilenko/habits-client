<template>
  <div class="RichTextEditor" :class="{ 'RichTextEditor--compact': compact }">
    <QuillEditor
      v-model:content="contentRef"
      content-type="html"
      :theme="theme"
      :placeholder="placeholder"
      :read-only="readOnly"
      :options="editorOptions"
      class="RichTextEditor__quill"
      @update:content="emitUpdate"
      @text-change="emitUpdate"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { QuillEditor } from '@vueup/vue-quill'

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

  const editorOptions = computed(() => ({
    modules: {
      toolbar: props.compact
        ? [['bold', 'italic'], ['link'], [{ list: 'ordered' }, { list: 'bullet' }]]
        : [
            ['bold', 'italic', 'underline', 'strike'],
            [{ header: [1, 2, 3, false] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'blockquote', 'code-block'],
            ['clean'],
          ],
    },
  }))

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
</style>
