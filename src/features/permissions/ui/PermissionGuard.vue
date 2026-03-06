<template>
  <div>
    <slot v-if="hasPermission" />
    <component v-else-if="fallback" :is="fallback" />
  </div>
</template>

<script setup lang="ts">
  import type { Component } from 'vue'
  import type { PermissionString } from '@/entities/role'
  import { usePermissions } from '../model/use-permissions'

  const props = defineProps<{
    permission: PermissionString | PermissionString[]
    requireAll?: boolean
    fallback?: Component
  }>()

  const { can, canAny, canAll } = usePermissions()

  const hasPermission =
    Array.isArray(props.permission) && props.requireAll
      ? canAll(props.permission)
      : Array.isArray(props.permission)
        ? canAny(props.permission)
        : can(props.permission)
</script>
