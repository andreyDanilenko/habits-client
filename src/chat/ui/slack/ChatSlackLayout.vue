<template>
  <div class="h-full min-h-0 flex overflow-hidden rounded-(--radius-xl) border border-border-default">
    <div class="w-[320px] max-w-[85vw] flex-shrink-0">
      <ChatSidebar :expanded="expanded" @toggleExpand="$emit('toggleExpand')" @openSettings="settingsOpen = true" />
    </div>

    <div class="flex-1 min-w-0">
      <ChatThreadView @openSettings="settingsOpen = true" />
    </div>

    <Transition name="chat-settings">
      <div v-if="settingsOpen" class="w-[360px] max-w-[90vw] flex-shrink-0">
        <ChatSettingsPanel @close="settingsOpen = false" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import ChatSidebar from './ChatSidebar.vue'
  import ChatThreadView from './ChatThreadView.vue'
  import ChatSettingsPanel from './ChatSettingsPanel.vue'

  defineProps<{
    expanded: boolean
  }>()

  defineEmits<{
    (e: 'toggleExpand'): void
  }>()

  const settingsOpen = ref(false)
</script>

<style scoped>
  .chat-settings-enter-active,
  .chat-settings-leave-active {
    transition:
      opacity 160ms ease,
      transform 160ms ease;
    will-change: opacity, transform;
  }

  .chat-settings-enter-from,
  .chat-settings-leave-to {
    opacity: 0;
    transform: translateX(10px);
  }
</style>

