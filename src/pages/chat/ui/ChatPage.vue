<template>
  <div class="h-[calc(100vh-10rem)] min-h-[560px]">
    <ChatSlackLayout class="h-full" :expanded="true" />
  </div>
</template>

<script setup lang="ts">
  import ChatSlackLayout from '@/chat/ui/slack/ChatSlackLayout.vue'
</script>

