<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <AppHeader v-if="showHeader" :sidebar-ref="sidebarRef" />
    <div class="flex flex-1 overflow-hidden">
      <AppSidebar v-if="showHeader" ref="sidebarRef" />
      <main class="flex-1 overflow-y-auto">
        <div class="container mx-auto px-4 py-6 md:py-8">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
    <ModalProvider />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { AppHeader } from '@/widgets/header'
  import { AppSidebar } from '@/widgets/sidebar'
  import ModalProvider from '@/app/providers/ModalProvider.vue'

  const route = useRoute()
  const showHeader = computed(() => route.name !== 'Login' && route.name !== 'Register')
  const sidebarRef = ref<InstanceType<typeof AppSidebar> | null>(null)
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
