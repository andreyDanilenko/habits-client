<template>
  <Modal
    :is-open="isOpen"
    content-class="bg-bg-primary rounded-(--radius-xl) shadow-card-hover p-(--spacing-6) max-w-md w-full"
    @update:is-open="$emit('update:isOpen', $event)"
  >
    <form class="space-y-(--spacing-4)" @submit.prevent="$emit('save')">
      <h2 class="text-text-primary">
        {{ isEdit ? 'Редактировать заметку' : 'Новая заметка' }}
      </h2>
      <input
        :value="form.title"
        type="text"
        placeholder="Заголовок"
        required
        class="w-full px-(--spacing-3) py-(--spacing-2) border border-border-default rounded-(--radius-md) focus:outline-none focus:ring-2 transition-colors bg-bg-primary text-text-primary placeholder:text-text-muted text-(--text-sm) focus:ring-primary-default focus:border-primary-default"
        @input="emitForm($event, 'title')"
      />
      <Textarea
        :model-value="form.content"
        placeholder="Текст (необязательно)"
        :rows="4"
        @update:model-value="$emit('update:form', { ...form, content: $event })"
      />
      <div class="flex justify-end gap-(--spacing-2)">
        <Button type="button" variant="outline" @click="$emit('close')">Отмена</Button>
        <Button type="submit" variant="primary" :loading="saving">Сохранить</Button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
  import { Button, Modal, Textarea } from '@/shared/ui'

  const props = defineProps<{
    isOpen: boolean
    isEdit: boolean
    form: { title: string; content: string }
    saving: boolean
  }>()

  const emit = defineEmits<{
    'update:isOpen': [value: boolean]
    'update:form': [value: { title: string; content: string }]
    close: []
    save: []
  }>()

  function emitForm(event: Event, field: 'title' | 'content') {
    const target = event.target as HTMLInputElement
    const value = target?.value ?? ''
    emit(
      'update:form',
      field === 'title' ? { ...props.form, title: value } : { ...props.form, content: value },
    )
  }
</script>
