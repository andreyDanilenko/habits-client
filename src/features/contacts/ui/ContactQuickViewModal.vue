<template>
  <ModalContent title="Быстрый просмотр" :show-close-button="true" @close="$emit('close')">
    <ContactQuickViewPanel
      :contact="contact"
      @close="$emit('close')"
      @edit="handleEdit"
      @open-card="handleOpenCard"
      @create-deal="handleCreateDeal"
    />
  </ModalContent>
</template>

<script setup lang="ts">
  import { ModalContent } from '@/shared/ui'
  import ContactQuickViewPanel from './ContactQuickViewPanel.vue'
  import type { Contact } from '@/entities/contact'

  const props = defineProps<{
    contact: Contact
    onEdit?: (contact: Contact) => void
    onOpenCard?: (contact: Contact) => void
    onCreateDeal?: (contact: Contact) => void
  }>()

  const emit = defineEmits<{ close: [] }>()

  function handleEdit(contact: Contact) {
    props.onEdit?.(contact)
    emit('close')
  }

  function handleOpenCard(contact: Contact) {
    props.onOpenCard?.(contact)
    emit('close')
  }

  function handleCreateDeal(contact: Contact) {
    props.onCreateDeal?.(contact)
    emit('close')
  }
</script>
