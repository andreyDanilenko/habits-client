<template>
  <div class="flex items-center gap-(--spacing-2)" :class="wrapperClass" @keydown.escape="cancel">
    <Input
      ref="inputRef"
      v-model="draft"
      :placeholder="placeholder"
      size="sm"
      class="flex-1"
      @keydown.enter="commit"
    />
    <Button
      variant="link"
      size="xs"
      :disabled="!props.canCommit(draft)"
      custom-class="TaskAddFormInline__Add text-[11px]"
      @click="commit"
    >
      Добавить
    </Button>
    <Button
      variant="link"
      size="xs"
      custom-class="TaskAddFormInline__Cancel text-[11px] text-text-muted"
      @click="cancel"
    >
      Отмена
    </Button>
  </div>
</template>

<script setup lang="ts">
  import { ref, nextTick } from 'vue'
  import { Button, Input } from '@/shared/ui'

  const props = withDefaults(
    defineProps<{
      placeholder?: string
      canCommit?: (value: string) => boolean
      wrapperClass?: string
    }>(),
    {
      placeholder: 'Добавить...',
      canCommit: (v: string) => !!v.trim(),
      wrapperClass: '',
    },
  )

  const emit = defineEmits<{
    add: [value: string]
    cancel: []
  }>()

  const draft = ref('')
  const inputRef = ref<InstanceType<typeof Input> | null>(null)


  function commit() {
    const v = draft.value.trim()
    if (!props.canCommit(v)) return
    emit('add', v)
    draft.value = ''
  }

  function cancel() {
    draft.value = ''
    emit('cancel')
  }

  defineExpose({
    focus: () => nextTick(() => inputRef.value?.focus()),
  })
</script>

<style scoped>
  @media (hover: hover) {
    .TaskAddFormInline__Add:not(:disabled):hover {
      color: var(--color-primary-dark);
    }
    .TaskAddFormInline__Cancel:hover {
      color: var(--color-text-secondary);
    }
  }
</style>
