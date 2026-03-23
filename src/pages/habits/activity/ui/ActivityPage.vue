<template>
  <BasePageLayout :title="t('habits.activity.title')" :description="t('habits.activity.description')">
    <template #content>
      <div v-if="isLoading" class="text-center py-12">
        <Spinner />
        <p class="text-text-secondary mt-4">{{ t('common.loading') }}</p>
      </div>

      <EmptyState
        v-else-if="activities.length === 0"
        :title="t('habits.activity.emptyTitle')"
        :description="t('habits.activity.emptyDescription')"
        :show-action-button="false"
        :show-icon="false"
      />

      <div v-else class="space-y-4" v-auto-animate>
        <div
          v-for="activity in activities"
          :key="activity.id"
          class="flex items-start space-x-3 p-4 rounded-lg border border-border-default hover:bg-bg-secondary transition-colors"
        >
          <div
            class="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0"
          >
            <span class="text-primary-default text-lg">{{ activity.emoji || '•' }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-text-primary">{{ activity.title }}</p>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <span class="text-xs text-text-secondary">{{
                formatRelativeTime(activity.createdAt)
              }}</span>
              <Badge
                v-if="activity.userName && activity.userName !== 'null'"
                variant="outline"
                class="text-xs"
              >
                {{ activity.userName }}
              </Badge>
            </div>
          </div>
        </div>

        <div v-if="total > pageSize" class="pt-4">
          <Pagination
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </template>
  </BasePageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { useAppI18n } from '@/shared/lib/i18n'
  import { BasePageLayout } from '@/shared/ui/common'

  const { t } = useAppI18n()
  import { Spinner, EmptyState, Badge, Pagination } from '@/shared/ui'
  import { habitService, type HabitActivity } from '@/entities/habit'
  import { useWorkspaceStore } from '@/entities/workspace'
  import { useHabitStore } from '@/entities/habit'
  import { formatRelativeTime } from '@/shared/lib/date'

  const workspaceStore = useWorkspaceStore()
  const habitStore = useHabitStore()
  const activities = ref<HabitActivity[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const currentPage = ref(1)
  const pageSize = 20

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? null)

  const fetchActivities = async (options?: { background?: boolean }) => {
    const wsId = workspaceId.value
    if (!wsId) {
      activities.value = []
      total.value = 0
      return
    }
    const isBackground = options?.background === true
    if (!isBackground) {
      isLoading.value = true
    }
    try {
      const offset = (currentPage.value - 1) * pageSize
      const { activities: list, total: t } = await habitService.getActivities(wsId, {
        limit: pageSize,
        offset,
      })
      activities.value = list
      total.value = t
    } catch {
      activities.value = []
      total.value = 0
    } finally {
      if (!isBackground) {
        isLoading.value = false
      }
    }
  }

  const handlePageChange = (page: number) => {
    currentPage.value = page
    fetchActivities()
  }

  watch(workspaceId, (id) => {
    if (id) {
      currentPage.value = 1
      fetchActivities()
    } else {
      activities.value = []
      total.value = 0
    }
  })

  watch(
    () => habitStore.activityRefreshTrigger,
    () => {
      if (workspaceId.value) fetchActivities({ background: true })
    },
  )

  onMounted(() => {
    if (workspaceId.value) fetchActivities()
  })
</script>
