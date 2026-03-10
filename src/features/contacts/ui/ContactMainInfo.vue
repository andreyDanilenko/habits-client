<template>
  <section class="space-y-(--spacing-6)">
    <div>
      <h3 class="text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)">
        Контактные данные
      </h3>
      <dl class="space-y-(--spacing-2) text-(--text-sm)">
        <div v-for="(p, i) in contact.phones" :key="`p-${i}`" class="flex gap-(--spacing-2)">
          <dt class="text-text-muted w-28">{{ phoneTypeLabel(p.type) }}:</dt>
          <dd class="text-(--text-sm) text-text-primary">
            <a :href="`tel:${p.number}`" class="text-primary-default hover:underline">
              {{ p.number }}
            </a>
          </dd>
        </div>
        <div v-for="(e, i) in contact.emails" :key="`e-${i}`" class="flex gap-(--spacing-2)">
          <dt class="text-text-muted w-28">
            {{ e.type === 'work' ? 'Рабочий' : 'Личный' }} email:
          </dt>
          <dd class="text-(--text-sm) text-text-primary">
            <a :href="`mailto:${e.address}`" class="text-primary-default hover:underline">
              {{ e.address }}
            </a>
          </dd>
        </div>
        <div v-if="contact.birthday" class="flex gap-(--spacing-2)">
          <dt class="text-text-muted w-28">День рождения:</dt>
          <dd class="text-(--text-sm) text-text-primary">
            {{ formatContactDate(contact.birthday) }}
          </dd>
        </div>
        <div class="flex gap-(--spacing-2)">
          <dt class="text-text-muted w-28">Соцсети:</dt>
          <dd class="text-(--text-sm) text-text-primary text-text-muted">
            Telegram, WhatsApp, VK — (скоро)
          </dd>
        </div>
        <template v-if="!contact.phones?.length && !contact.emails?.length && !contact.birthday">
          <dd class="text-(--text-sm) text-text-primary text-text-muted">—</dd>
        </template>
      </dl>
    </div>
    <div>
      <h3 class="text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)">Адрес</h3>
      <p class="text-(--text-sm) text-text-muted">Страна, город, улица — (скоро)</p>
    </div>
    <div>
      <h3 class="text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)">
        Дополнительная информация
      </h3>
      <div v-if="contact.tags?.length" class="flex flex-wrap gap-(--spacing-2)">
        <span
          v-for="tag in contact.tags"
          :key="tag"
          class="px-(--spacing-2) py-(--spacing-0-5) rounded bg-bg-tertiary text-text-secondary text-(--text-sm)"
        >
          {{ tag }}
        </span>
      </div>
      <p v-else class="text-(--text-sm) text-text-muted">Теги не указаны. Комментарий — (скоро).</p>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { phoneTypeLabel, formatContactDate } from '../lib/format'
  import type { Contact } from '@/entities/contact'

  defineProps<{
    contact: Contact
  }>()
</script>
