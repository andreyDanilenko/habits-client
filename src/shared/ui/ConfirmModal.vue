<template>
  <ModalContent :title="title" :description="description" @close="$emit('close')">
    <slot>
      <p class="text-text-primary">{{ message }}</p>
    </slot>

    <template #footer>
      <div class="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" @click="$emit('close')"> Отмена </Button>
        <Button
          type="button"
          :variant="confirmVariant === 'danger' ? 'danger' : 'primary'"
          :loading="loading"
          @click="$emit('confirm', true)"
        >
          {{ confirmText }}
        </Button>
      </div>
    </template>
  </ModalContent>
</template>

<script setup lang="ts">
  import ModalContent from './ModalContent.vue'
  import Button from './Button.vue'

  interface Props {
    title?: string
    description?: string
    message?: string
    confirmText?: string
    confirmVariant?: 'primary' | 'danger'
    loading?: boolean
  }

  withDefaults(defineProps<Props>(), {
    title: 'Подтверждение',
    message: 'Вы уверены, что хотите выполнить это действие?',
    confirmText: 'Подтвердить',
    confirmVariant: 'primary',
    loading: false,
  })

  defineEmits<{
    close: []
    confirm: [value: boolean]
  }>()
</script>
