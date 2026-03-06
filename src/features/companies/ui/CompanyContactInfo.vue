<template>
  <div>
    <h3 class="text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)">
      Контакты
    </h3>
    <dl class="space-y-(--spacing-2) text-(--text-sm)">
      <div v-if="phone" class="flex gap-(--spacing-2)">
        <dt class="text-text-muted w-24">Телефон:</dt>
        <dd>
          <a
            :href="`tel:${phone}`"
            class="text-primary-default hover:underline"
            >{{ phone }}</a
          >
        </dd>
      </div>
      <div v-if="email" class="flex gap-(--spacing-2)">
        <dt class="text-text-muted w-24">Email:</dt>
        <dd>
          <a
            :href="`mailto:${email}`"
            class="text-primary-default hover:underline"
            >{{ email }}</a
          >
        </dd>
      </div>
      <div v-if="website" class="flex gap-(--spacing-2)">
        <dt class="text-text-muted w-24">Сайт:</dt>
        <dd>
          <a
            :href="website"
            target="_blank"
            rel="noopener"
            class="text-primary-default hover:underline"
            >{{ website }}</a
          >
        </dd>
      </div>
      <template v-if="!phone && !email && !website">
        <dd class="text-text-muted">—</dd>
      </template>
    </dl>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    phone?: string | null
    email?: string | null
    website?: string | null
  }>()
</script>
