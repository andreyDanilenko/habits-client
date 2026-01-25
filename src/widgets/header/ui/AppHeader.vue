<template>
  <header class="sticky top-0 z-50 bg-white border-b border-gray-300 shadow-sm">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Лого -->
        <router-link to="/" class="flex items-center space-x-3">
          <Logo :size="32" />
          <span class="text-xl font-bold text-gray-900 hidden lg:inline"> HabitFlow </span>
        </router-link>

        <!-- Центр: навигация -->
        <nav class="hidden lg:flex items-center space-x-6">
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
          <WorkspaceSwitcher />

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
  import { Logo } from '@/shared/ui/icon'
  import TodayStats from './TodayStats.vue'
  import WorkspaceSwitcher from './WorkspaceSwitcher.vue'
  import Notifications from './Notifications.vue'
  import ProfileDropdown from './ProfileDropdown.vue'

  const navItems = computed(() => [
    { path: '/', label: 'Дашборд' },
    { path: '/habits', label: 'Привычки' },
    { path: '/calendar', label: 'Календарь' },
    { path: '/journal', label: 'Дневник' },
  ])
</script>
