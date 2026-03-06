<template>
  <div class="ContactQuickViewPanel flex flex-col gap-(--spacing-4)">
    <div class="rounded-(--radius-lg) bg-bg-tertiary/60 p-(--spacing-4)">
      <p class="font-semibold text-text-primary text-(--text-lg)">{{ fullName }}</p>
      <dl class="mt-(--spacing-4) space-y-(--spacing-3) text-(--text-sm)">
        <template v-if="primaryPhone">
          <div>
            <dt class="text-(--text-xs) font-medium uppercase tracking-wider text-text-muted">
              Телефон
            </dt>
            <dd class="mt-0.5">
              <a
                :href="`tel:${primaryPhone}`"
                class="text-primary-default hover:text-primary-dark hover:underline transition-colors"
              >
                {{ primaryPhone }}
              </a>
            </dd>
          </div>
        </template>
        <template v-if="primaryEmail">
          <div>
            <dt class="text-(--text-xs) font-medium uppercase tracking-wider text-text-muted">
              Email
            </dt>
            <dd class="mt-0.5">
              <a
                :href="`mailto:${primaryEmail}`"
                class="text-primary-default hover:text-primary-dark hover:underline transition-colors"
              >
                {{ primaryEmail }}
              </a>
            </dd>
          </div>
        </template>
        <div>
          <dt class="text-(--text-xs) font-medium uppercase tracking-wider text-text-muted">
            Компания
          </dt>
          <dd class="mt-0.5 text-text-primary">{{ companyName }}</dd>
        </div>
        <div>
          <dt class="text-(--text-xs) font-medium uppercase tracking-wider text-text-muted">
            Последняя активность
          </dt>
          <dd class="mt-0.5 text-text-secondary">{{ lastActivity }}</dd>
        </div>
      </dl>
    </div>
    <div class="border-t border-border-default pt-(--spacing-4) space-y-(--spacing-2)">
      <Button variant="outline" size="md" class="w-full" @click="$emit('edit', contact)">
        Редактировать
      </Button>
      <Button variant="outline" size="md" class="w-full" @click="$emit('call', contact)">
        Позвонить
      </Button>
      <Button variant="outline" size="md" class="w-full" @click="$emit('email', contact)">
        Написать письмо
      </Button>
      <Button variant="primary" size="md" class="w-full" @click="$emit('create-deal', contact)">
        Создать сделку
      </Button>
      <Button variant="ghost" size="md" class="w-full" @click="$emit('open-card', contact)">
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

  const fullName = computed(
    () => `${props.contact.firstName} ${props.contact.lastName}`.trim() || '—',
  )
  const primaryPhone = computed(
    () =>
      props.contact.phones?.find((p) => p.isPrimary)?.number ??
      props.contact.phones?.[0]?.number ??
      '',
  )
  const primaryEmail = computed(
    () =>
      props.contact.emails?.find((e) => e.isPrimary)?.address ??
      props.contact.emails?.[0]?.address ??
      '',
  )
  const companyName = computed(() => props.companyName ?? '—')
  const lastActivity = computed(() =>
    props.contact.updatedAt ? new Date(props.contact.updatedAt).toLocaleString('ru-RU') : '—',
  )
</script>
