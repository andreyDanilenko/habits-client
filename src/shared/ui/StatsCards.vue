<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <Card
      v-for="(item, index) in items"
      :key="index"
      :border="true"
      :padding="true"
      :class="getCardClasses(item.color ?? colors[index % colors.length])"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">{{ item.label }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ item.value }}</p>
        </div>
        <div
          v-if="item.emoji"
          :class="getIconWrapperClasses(item.color ?? colors[index % colors.length])"
          class="w-12 h-12 rounded-lg flex items-center justify-center"
        >
          <span class="text-2xl">{{ item.emoji }}</span>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
  import Card from './Card.vue'
  import type { StatColor, StatsCardItem } from './StatsCards.types'

  export type { StatsCardItem } from './StatsCards.types'

  const colors: StatColor[] = ['indigo', 'emerald', 'amber']

  defineProps<{
    items: StatsCardItem[]
  }>()

  const cardClassMap: Record<StatColor, string> = {
    indigo: 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200',
    emerald: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200',
    amber: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200',
  }

  const iconWrapperClassMap: Record<StatColor, string> = {
    indigo: 'bg-indigo-100',
    emerald: 'bg-emerald-100',
    amber: 'bg-amber-100',
  }

  function getCardClasses(color: StatColor): string {
    return cardClassMap[color]
  }

  function getIconWrapperClasses(color: StatColor): string {
    return iconWrapperClassMap[color]
  }
</script>
