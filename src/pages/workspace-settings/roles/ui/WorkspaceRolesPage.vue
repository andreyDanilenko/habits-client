<template>
  <div class="max-w-5xl mx-auto py-6 space-y-6">
    <Card class="p-6">
      <RolesList />
    </Card>
    <Card class="p-6">
      <SystemRolesPermissions />
    </Card>
  </div>
</template>

<script setup lang="ts">
  import { Card } from '@/shared/ui'
  import { RolesList, SystemRolesPermissions } from '@/features/roles'
</script>
