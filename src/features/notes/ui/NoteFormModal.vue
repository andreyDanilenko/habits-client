<template>
  <Modal :is-open="isOpen" content-class="bg-white rounded-xl shadow-lg p-6" @update:is-open="$emit('update:isOpen', $event)">
    <form class="space-y-4" @submit.prevent="$emit('save')">
      <h2 class="text-lg font-semibold">{{ isEdit ? 'Редактировать заметку' : 'Новая заметка' }}</h2>
      <input
        :value="form.title"
        type="text"
        placeholder="Заголовок"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md"
        @input="emitForm($event, 'title')"
      />
      <textarea
        :value="form.content"
        placeholder="Текст (необязательно)"
        rows="4"
        class="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[100px]"
        @input="emitForm($event, 'content')"
      />
      <div class="flex justify-end gap-2">
        <Button type="button" variant="outline" @click="$emit('close')">Отмена</Button>
        <Button type="submit" variant="primary" :loading="saving">Сохранить</Button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
  import { Button, Modal } from '@/shared/ui'

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
    emit('update:form', field === 'title' ? { ...props.form, title: value } : { ...props.form, content: value })
  }
</script>
