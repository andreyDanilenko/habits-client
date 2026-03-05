<template>
  <Modal :is-open="isOpen" @close="$emit('close')">
    <ModalContent
      :title="project ? 'Редактировать проект' : 'Новый проект'"
      :show-close-button="true"
      @close="$emit('close')"
    >
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <FormField label="Название" required :error="errors.name">
          <Input
            v-model="form.name"
            placeholder="Например: Клиент ООО Ромашка"
            maxlength="255"
            @blur="validateName"
          />
        </FormField>
        <FormField label="Описание">
          <Textarea
            v-model="form.description"
            placeholder="Краткое описание проекта (необязательно)"
            :rows="3"
          />
        </FormField>
        <p v-if="submitError" class="text-sm text-danger-default">{{ submitError }}</p>
        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" @click="$emit('close')">Отмена</Button>
          <Button type="submit" variant="primary" :disabled="saving">
            {{ project ? 'Сохранить' : 'Создать' }}
          </Button>
        </div>
      </form>
    </ModalContent>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { Modal, ModalContent, Button, Input, FormField, Textarea } from '@/shared/ui'
  import type { Project, CreateProjectDto, UpdateProjectDto } from '@/entities/project'

  const props = defineProps<{
    isOpen: boolean
    project: Project | null
  }>()

  const emit = defineEmits<{
    close: []
    create: [dto: CreateProjectDto]
    update: [id: string, dto: UpdateProjectDto]
  }>()

  const form = ref({ name: '', description: '' })
  const errors = ref<{ name?: string }>({})
  const submitError = ref('')
  const saving = ref(false)

  watch(
    () => [props.isOpen, props.project],
    () => {
      if (props.project) {
        form.value = {
          name: props.project.name,
          description: props.project.description ?? '',
        }
      } else {
        form.value = { name: '', description: '' }
      }
      errors.value = {}
      submitError.value = ''
    },
    { immediate: true },
  )

  function validateName(): boolean {
    const name = form.value.name?.trim()
    if (!name) {
      errors.value = { name: 'Название обязательно' }
      return false
    }
    errors.value = {}
    return true
  }

  function handleSubmit() {
    submitError.value = ''
    if (!validateName()) return
    const name = form.value.name.trim()
    const description = form.value.description?.trim() || undefined
    if (props.project) {
      emit('update', props.project.id, { name, description: description ?? null })
    } else {
      emit('create', { name, description: description ?? null })
    }
  }
</script>
