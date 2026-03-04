<template>
  <div class="app-layout bg-bg-secondary flex flex-col overflow-hidden">
    <AppHeader v-if="showHeader" :sidebar-ref="sidebarRef" />
    <div class="flex flex-1 min-h-0 overflow-hidden items-stretch">
      <AppSidebar v-if="showHeader" ref="sidebarRef" />
      <main 
        class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain"
        :class="[showHeader ? 'bg-bg-primary' : 'bg-bg-secondary']"
      >
        <div :class="contentClass">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component
                v-if="Component"
                :is="Component"
                :key="route.fullPath"
              />
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
  
  const contentClass = computed(() => {
    return showHeader.value
      ? 'max-w-6xl mx-auto px-(--spacing-4) py-(--spacing-6) md:py-(--spacing-8)'
      : ''
  })
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
