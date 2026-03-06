<template>
  <ContactsTableSection
    title="Сотрудники компании"
    :contacts="contacts"
    empty-text="Нет привязанных контактов."
  >
    <template #actions>
      <Button size="md" variant="ghost" @click="onAttachContact">
        Привязать контакт
      </Button>
      <Button size="md" variant="outline" @click="onCreateContact">
        Создать контакт
      </Button>
    </template>
  </ContactsTableSection>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'
  import { ContactsTableSection } from '@/features/contacts'
  import type { Contact } from '@/entities/contact'

  defineProps<{
    contacts: Contact[]
    onAttachContact: () => void
    onCreateContact: () => void
  }>()
</script>
