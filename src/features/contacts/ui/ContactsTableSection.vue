<template>
  <div>
    <div class="flex items-center justify-between gap-(--spacing-4) mb-(--spacing-4)">
      <h3 class="text-(--text-sm) font-medium text-text-secondary">
        {{ title }}
      </h3>
      <div class="flex gap-(--spacing-2)">
        <slot name="actions" />
      </div>
    </div>
    <div
      v-if="contacts.length === 0"
      class="text-text-muted text-(--text-sm) py-(--spacing-4)"
    >
      {{ emptyText }}
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-(--text-sm)">
        <thead>
          <tr class="border-b border-border-default text-left text-text-muted">
            <th class="py-(--spacing-2) pr-(--spacing-4)">Имя</th>
            <th class="py-(--spacing-2) pr-(--spacing-4)">Должность</th>
            <th class="py-(--spacing-2) pr-(--spacing-4)">Email / Телефон</th>
            <th class="py-(--spacing-2) w-20" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="contact in contacts"
            :key="contact.id"
            class="border-b border-border-light"
          >
            <td class="py-(--spacing-2) pr-(--spacing-4)">
              <router-link
                :to="{ name: 'CrmContactDetail', params: { id: contact.id } }"
                class="text-primary-default hover:underline"
              >
                {{ getContactDisplayName(contact) }}
              </router-link>
            </td>
            <td class="py-(--spacing-2) pr-(--spacing-4) text-text-primary">
              {{ contact.position ?? '—' }}
            </td>
            <td class="py-(--spacing-2) pr-(--spacing-4) text-text-primary">
              {{ contact.emails?.[0]?.address ?? contact.phones?.[0]?.number ?? '—' }}
            </td>
            <td class="py-(--spacing-2)" />
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { contactDisplayName } from '../lib/format'
  import type { Contact } from '@/entities/contact'

  defineProps<{
    title: string
    contacts: Contact[]
    emptyText?: string
  }>()

  const getContactDisplayName = contactDisplayName
</script>
