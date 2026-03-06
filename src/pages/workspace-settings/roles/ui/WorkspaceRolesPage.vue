<template>
  <div class="max-w-5xl mx-auto py-6">
    <Card class="p-6">
      <RolesList />
    </Card>
  </div>
</template>

<script setup lang="ts">
  import { Card } from '@/shared/ui'
  import { RolesList } from '@/features/roles'
</script>
