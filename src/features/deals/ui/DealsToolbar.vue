<template>
  <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
    <div class="flex gap-2 flex-shrink-0">
      <Button variant="primary" size="md" @click="$emit('create')">
        <PlusIcon class="size-5 mr-2" />
        Создать сделку
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'
  import { PlusIcon } from '@/shared/ui/icon'

  defineEmits<{ create: [] }>()
</script>
