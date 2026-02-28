<template>
  <Modal :is-open="isOpen" @close="$emit('close')">
    <ModalContent
      :title="company ? 'Редактировать компанию' : 'Новая компания'"
      :show-close-button="true"
      @close="$emit('close')"
    >
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <FormField label="Название" required>
          <Input v-model="form.name" placeholder="Название компании" required />
        </FormField>
        <FormField label="ИНН">
          <Input v-model="form.inn" placeholder="ИНН" />
        </FormField>
        <FormField label="Телефон">
          <Input v-model="form.phone" placeholder="+7 (495) 000-00-00" />
        </FormField>
        <FormField label="Email">
          <Input v-model="form.email" type="email" placeholder="email@company.ru" />
        </FormField>
        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" @click="$emit('close')">Отмена</Button>
          <Button type="submit" :loading="saving">Сохранить</Button>
        </div>
      </form>
    </ModalContent>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { Modal, ModalContent, Button, Input, FormField } from '@/shared/ui'
  import type { Company, CreateCompanyDto } from '@/entities/company'

  const props = defineProps<{
    isOpen: boolean
    company: Company | null
  }>()

  const emit = defineEmits<{
    close: []
    save: [data: CreateCompanyDto]
    update: [id: string, data: CreateCompanyDto]
  }>()

  const saving = ref(false)
  const form = ref({
    name: '',
    inn: '',
    phone: '',
    email: '',
  })

  watch(
    () => [props.isOpen, props.company] as const,
    ([open, company]) => {
      if (open) {
        form.value = {
          name: company?.name ?? '',
          inn: company?.inn ?? '',
          phone: company?.phone ?? '',
          email: company?.email ?? '',
        }
      }
    },
    { immediate: true },
  )

  const handleSubmit = async () => {
    if (!form.value.name.trim()) return
    saving.value = true
    try {
      const data: CreateCompanyDto = {
        name: form.value.name.trim(),
        inn: form.value.inn.trim() || undefined,
        phone: form.value.phone.trim() || undefined,
        email: form.value.email.trim() || undefined,
      }
      if (props.company) {
        emit('update', props.company.id, data)
      } else {
        emit('save', data)
      }
      emit('close')
    } finally {
      saving.value = false
    }
  }
</script>
