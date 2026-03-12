<template>
  <BaseIcon v-bind="$attrs">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M19 21V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V21M19 21H5M19 21H21M5 21H3M9 7H10M9 11H10M14 7H15M14 11H15M9 15H10M14 15H15M9 19H10M14 19H15"
    />
    <rect x="7" y="7" width="4" height="2" fill="none" />
    <rect x="13" y="7" width="4" height="2" fill="none" />
  </BaseIcon>
</template>

<script setup lang="ts">
  import BaseIcon from './BaseIcon.vue'
</script>
