<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" v-auto-animate>
    <Card
      v-for="habit in habits"
      :key="habit.id"
      class="hover:shadow-card-hover transition-shadow cursor-pointer group"
      :border="true"
      :padding="true"
      @click="$emit('select-habit', habit)"
    >
      <HabitsListItem
        :habit="habit"
        :progress="progressMap[habit.id] || 0"
        @edit="$emit('edit-habit', $event)"
        @mark-completion="$emit('mark-completion', $event)"
        @delete="$emit('delete-habit', $event)"
      />
    </Card>
  </div>
</template>

<script setup lang="ts">
  import { Card } from '@/shared/ui'
  import HabitsListItem from './HabitsListItem.vue'
  import type { Habit } from '@/entities/habit'

  defineProps<{
    habits: Habit[]
    progressMap: Record<string, number>
  }>()

  defineEmits<{
    'select-habit': [habit: Habit]
    'edit-habit': [habit: Habit]
    'delete-habit': [habit: Habit]
    'mark-completion': [habit: Habit]
  }>()
</script>
