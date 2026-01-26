<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <Card
      :border="true"
      :padding="true"
      class="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">Всего привычек</p>
          <p class="text-2xl font-bold text-gray-900">{{ totalCount }}</p>
        </div>
        <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
          <span class="text-2xl">📋</span>
        </div>
      </div>
    </Card>
    <Card
      :border="true"
      :padding="true"
      class="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">Выполнено сегодня</p>
          <p class="text-2xl font-bold text-gray-900">{{ completedToday }}</p>
        </div>
        <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
          <span class="text-2xl">✅</span>
        </div>
      </div>
    </Card>
    <Card
      :border="true"
      :padding="true"
      class="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">Процент выполнения</p>
          <p class="text-2xl font-bold text-gray-900">{{ completionRate }}%</p>
        </div>
        <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
          <span class="text-2xl">📊</span>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
  import { Card } from '@/shared/ui'

  defineProps<{
    totalCount: number
    completedToday: number
    completionRate: number
  }>()
</script>
