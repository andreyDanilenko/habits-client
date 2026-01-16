<template>
  <div>
    <Modal
      v-for="modal in modals"
      :key="modal.id.toString()"
      :is-open="true"
      :close-on-backdrop="true"
      :close-on-escape="true"
      @update:is-open="modal.close()"
      @close="modal.close()"
    >
      <component
        :is="modal.config.component"
        v-bind="modal.config.props"
        @close="modal.close()"
        @confirm="handleConfirm(modal, $event)"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Modal } from '@/shared/ui'
  import { modalManager } from '@/shared/lib/modal'
  import type { ModalInstance } from '@/shared/lib/modal'

  const modals = computed(() => modalManager.currentModals)

  const handleConfirm = (modal: ModalInstance, result?: any) => {
    modal.config.onConfirm?.(result)
    modal.close(result)
  }
</script>
