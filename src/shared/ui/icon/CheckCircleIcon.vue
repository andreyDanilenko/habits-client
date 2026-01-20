<template>
  <BaseIcon v-bind="$attrs">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </BaseIcon>
</template>

<script setup lang="ts">
  import BaseIcon from './BaseIcon.vue'
</script>
