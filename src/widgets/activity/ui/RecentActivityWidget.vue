<template>
  <Card :border="true" :padding="true">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-text-primary">Недавняя активность</h2>
      <router-link
        to="/habits/activity"
        class="text-sm text-primary-default hover:text-primary-dark font-medium"
      >
        Вся активность →
      </router-link>
    </div>

    <div v-if="isLoading" class="text-center py-8">
      <p class="text-text-secondary">Загрузка...</p>
    </div>

    <div v-else-if="activities.length === 0" class="text-center py-8">
      <p class="text-text-secondary">Нет недавней активности</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="activity in activities" :key="activity.id" class="flex items-start space-x-3">
        <div
          class="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0"
        >
          <span class="text-primary-default text-sm">{{ activity.emoji || '•' }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-text-primary">{{ activity.title }}</p>
          <div class="flex items-center gap-2 mt-0.5 flex-wrap">
            <span class="text-xs text-text-secondary">{{ activity.time }}</span>
            <Badge v-if="activity.userName" variant="outline" class="text-xs">
              {{ activity.userName }}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { Card, Badge } from '@/shared/ui'
  import { habitService, useHabitStore } from '@/entities/habit'
  import { useWorkspaceStore } from '@/entities/workspace'
  import { formatRelativeTime } from '@/shared/lib/date'

  interface Activity {
    id: string
    emoji: string
    title: string
    time: string
    userName?: string
  }

  const workspaceStore = useWorkspaceStore()
  const habitStore = useHabitStore()
  const activities = ref<Activity[]>([])
  const isLoading = ref(false)

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? null)

  const fetchActivities = async () => {
    const wsId = workspaceId.value
    if (!wsId) {
      activities.value = []
      return
    }
    isLoading.value = true
    try {
      const { activities: list } = await habitService.getActivities(wsId, { limit: 3 })
      activities.value = list.map((a) => ({
        id: a.id,
        emoji: a.emoji || '•',
        title: a.title,
        time: formatRelativeTime(a.createdAt),
        userName: a.userName,
      }))
    } catch {
      activities.value = []
    } finally {
      isLoading.value = false
    }
  }

  watch(workspaceId, (id) => {
    if (id) fetchActivities()
    else activities.value = []
  })

  watch(
    () => habitStore.activityRefreshTrigger,
    () => {
      if (workspaceId.value) fetchActivities()
    },
  )

  onMounted(() => {
    if (workspaceId.value) fetchActivities()
  })
</script>
