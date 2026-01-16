<template>
  <header class="sticky top-0 z-50 bg-white border-b shadow-sm">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Лого -->
        <router-link to="/" class="flex items-center space-x-3">
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#6366f1" />
                <!-- indigo-500 -->
                <stop offset="100%" stop-color="#9333ea" />
                <!-- purple-600 -->
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#grad)" />
            <text
              x="16"
              y="16"
              text-anchor="middle"
              dominant-baseline="central"
              fill="white"
              font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              font-weight="bold"
              font-size="14"
              letter-spacing="0.5"
            >
              HF
            </text>
          </svg>
          <span class="text-xl font-bold text-gray-900 hidden md:inline"> HabitFlow </span>
        </router-link>

        <!-- Центр: навигация -->
        <nav class="hidden md:flex items-center space-x-6">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            active-class="text-indigo-600"
          >
            {{ item.label }}
          </router-link>
        </nav>

        <!-- Правая часть -->
        <div class="flex items-center space-x-4">
          <!-- Статистика сегодня -->
          <TodayStats />

          <!-- Переключение workspace -->
          <WorkspaceSwitcher v-if="workspaceStore.workspaces.length > 1" />

          <!-- Уведомления -->
          <Notifications />

          <!-- Профиль -->
          <ProfileDropdown />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import TodayStats from './TodayStats.vue'
  import WorkspaceSwitcher from './WorkspaceSwitcher.vue'
  import Notifications from './Notifications.vue'
  import ProfileDropdown from './ProfileDropdown.vue'
  import { useWorkspaceStore } from '@/entities/workspace'

  const workspaceStore = useWorkspaceStore()

  const navItems = computed(() => [
    { path: '/', label: 'Дашборд' },
    { path: '/habits', label: 'Привычки' },
    { path: '/calendar', label: 'Календарь' },
    { path: '/journal', label: 'Дневник' },
  ])
</script>
