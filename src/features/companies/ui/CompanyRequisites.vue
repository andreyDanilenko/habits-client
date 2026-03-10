<template>
  <div>
    <h3 class="text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)">Реквизиты</h3>
    <dl class="grid gap-(--spacing-2) sm:grid-cols-2 text-(--text-sm)">
      <div class="flex gap-(--spacing-2)">
        <dt class="text-text-muted w-28">Название:</dt>
        <dd class="text-text-primary">{{ name }}</dd>
      </div>
      <div v-if="inn" class="flex gap-(--spacing-2)">
        <dt class="text-text-muted w-28">ИНН:</dt>
        <dd class="text-text-primary">{{ inn }}</dd>
      </div>
      <div v-if="kpp" class="flex gap-(--spacing-2)">
        <dt class="text-text-muted w-28">КПП:</dt>
        <dd class="text-text-primary">{{ kpp }}</dd>
      </div>
      <div v-if="ogrn" class="flex gap-(--spacing-2)">
        <dt class="text-text-muted w-28">ОГРН:</dt>
        <dd class="text-text-primary">{{ ogrn }}</dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    name: string
    inn?: string | null
    kpp?: string | null
    ogrn?: string | null
  }>()
</script>
