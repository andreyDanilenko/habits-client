<template>
  <BaseIcon v-bind="$attrs">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6m-6-6 6-6"
    />
  </BaseIcon>
</template>

<script setup lang="ts">
  import BaseIcon from './BaseIcon.vue'
</script>
