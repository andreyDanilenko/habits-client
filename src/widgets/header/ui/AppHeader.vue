<template>
  <header class="sticky top-0 z-50 bg-white border-b shadow-sm">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Лого -->
        <router-link to="/" class="flex items-center space-x-3">
          <div
            class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center"
          >
            <span class="text-white font-bold text-sm">HF</span>
          </div>
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
          <TodayStatsWidget />

          <!-- Переключение workspace -->
          <WorkspaceSwitcherWidget v-if="workspaceStore.workspaces.length > 1" />

          <!-- Уведомления -->
          <NotificationsWidget />

          <!-- Профиль -->
          <ProfileDropdownWidget />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import TodayStatsWidget from './TodayStatsWidget.vue'
  import WorkspaceSwitcherWidget from './WorkspaceSwitcherWidget.vue'
  import NotificationsWidget from './NotificationsWidget.vue'
  import ProfileDropdownWidget from './ProfileDropdownWidget.vue'
  import { useWorkspaceStore } from '@/entities/workspace/model/workspace-store'

  const workspaceStore = useWorkspaceStore()  
  

  const navItems = computed(() => [
    { path: '/', label: 'Дашборд' },
    { path: '/habits', label: 'Привычки' },
    { path: '/calendar', label: 'Календарь' },
    { path: '/journal', label: 'Дневник' },
  ])
</script>
