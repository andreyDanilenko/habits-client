<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader v-if="showHeader" />
    <main class="container mx-auto px-4 py-6 md:py-8">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
  import AppHeader from './components/layout/AppHeader.vue'
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()
  const showHeader = computed(() => route.name !== 'Login' && route.name !== 'Register')
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
