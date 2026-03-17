<template>
  <ModalContent
    title="Быстрый просмотр"
    :show-close-button="true"
    :fullscreen-on-mobile="isMobile"
    @close="$emit('close')"
  >
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
  import { ref, onMounted, onUnmounted } from 'vue'
  import { ModalContent } from '@/shared/ui'
  import ContactQuickViewPanel from './ContactQuickViewPanel.vue'
  import type { Contact } from '@/entities/contact'

  const isMobile = ref(false)
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024
  }
  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

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
