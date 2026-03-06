<template>
  <ContactsTableSection
    title="Сотрудники компании"
    :contacts="contacts"
    empty-text="Нет привязанных контактов."
  >
    <template #actions>
      <PermissionGuard :permission="CRM_PERMISSIONS.companyUpdate">
        <Button size="md" variant="ghost" @click="onAttachContact">
          Привязать контакт
        </Button>
      </PermissionGuard>
      <PermissionGuard :permission="CRM_PERMISSIONS.contactCreate">
        <Button size="md" variant="outline" @click="onCreateContact">
          Создать контакт
        </Button>
      </PermissionGuard>
    </template>
  </ContactsTableSection>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'
  import { PermissionGuard } from '@/features/permissions'
  import { CRM_PERMISSIONS } from '@/features/permissions/config'
  import { ContactsTableSection } from '@/features/contacts'
  import type { Contact } from '@/entities/contact'

  defineProps<{
    contacts: Contact[]
    onAttachContact: () => void
    onCreateContact: () => void
  }>()
</script>
