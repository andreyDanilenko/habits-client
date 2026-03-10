<template>
  <DealsListSection
    title="Сделки по контакту"
    :subtitle="deals?.length ? `— всего: ${deals.length}` : undefined"
    empty-text="Пока нет сделок, связанных с этим контактом."
    :loading="loading"
    :deals="deals"
  >
    <template #actions>
      <PermissionGuard v-if="onAttachToDeal" :permission="CRM_PERMISSIONS.dealCreate">
        <Button size="md" variant="primary" @click="onAttachToDeal">
          Добавить в сделку
        </Button>
      </PermissionGuard>
      <slot name="actions" />
    </template>
  </DealsListSection>
</template>

<script setup lang="ts">
  import { Button, DealsListSection } from '@/shared/ui'
  import { PermissionGuard } from '@/features/permissions'
  import { CRM_PERMISSIONS } from '@/features/permissions/config'
  import type { Deal } from '@/entities/deal'

  defineProps<{
    deals: Deal[]
    loading?: boolean
    onAttachToDeal?: () => void
  }>()
</script>
