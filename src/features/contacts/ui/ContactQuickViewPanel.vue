<template>
  <div class="ContactQuickViewPanel flex flex-col gap-4">
    <div>
      <p class="font-medium text-text-primary text-lg">{{ fullName }}</p>
      <dl class="mt-4 space-y-2 text-sm">
        <template v-if="primaryPhone">
          <dt class="text-text-muted">Телефон</dt>
          <dd>
            <a :href="`tel:${primaryPhone}`" class="text-primary-default hover:underline">{{ primaryPhone }}</a>
          </dd>
        </template>
        <template v-if="primaryEmail">
          <dt class="text-text-muted">Email</dt>
          <dd>
            <a :href="`mailto:${primaryEmail}`" class="text-primary-default hover:underline">{{ primaryEmail }}</a>
          </dd>
        </template>
        <dt class="text-text-muted">Компания</dt>
        <dd>{{ companyName }}</dd>
        <dt class="text-text-muted">Последняя активность</dt>
        <dd>{{ lastActivity }}</dd>
      </dl>
    </div>
    <div class="border-t border-border-light pt-4 space-y-2">
      <Button variant="outline" size="sm" class="w-full" @click="$emit('edit', contact)">
        Редактировать
      </Button>
      <Button variant="outline" size="sm" class="w-full" @click="$emit('call', contact)">
        Позвонить
      </Button>
      <Button variant="outline" size="sm" class="w-full" @click="$emit('email', contact)">
        Написать письмо
      </Button>
      <Button variant="primary" size="sm" class="w-full" @click="$emit('create-deal', contact)">
        Создать сделку
      </Button>
      <Button variant="ghost" size="sm" class="w-full" @click="$emit('open-card', contact)">
        Открыть карточку
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Button } from '@/shared/ui'
  import type { Contact } from '@/entities/contact'

  const props = defineProps<{
    contact: Contact
    companyName?: string
  }>()

  defineEmits<{
    close: []
    edit: [contact: Contact]
    call: [contact: Contact]
    email: [contact: Contact]
    'create-deal': [contact: Contact]
    'open-card': [contact: Contact]
  }>()

  const fullName = computed(() => `${props.contact.firstName} ${props.contact.lastName}`.trim() || '—')
  const primaryPhone = computed(() => props.contact.phones?.find((p) => p.isPrimary)?.number ?? props.contact.phones?.[0]?.number ?? '')
  const primaryEmail = computed(() => props.contact.emails?.find((e) => e.isPrimary)?.address ?? props.contact.emails?.[0]?.address ?? '')
  const companyName = computed(() => props.companyName ?? '—')
  const lastActivity = computed(() => props.contact.updatedAt ? new Date(props.contact.updatedAt).toLocaleString('ru-RU') : '—')
</script>
