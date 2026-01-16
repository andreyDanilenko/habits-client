<template>
  <ModalContent :title="title" :description="description" @close="$emit('close')">
    <slot>
      <p class="text-gray-700">{{ message }}</p>
    </slot>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <Button type="button" variant="outline" @click="$emit('close')"> Отмена </Button>
        <Button type="button" :variant="confirmVariant" @click="$emit('confirm', true)">
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
  }

  withDefaults(defineProps<Props>(), {
    title: 'Подтверждение',
    message: 'Вы уверены, что хотите выполнить это действие?',
    confirmText: 'Подтвердить',
    confirmVariant: 'primary',
  })

  defineEmits<{
    close: []
    confirm: [value: boolean]
  }>()
</script>
