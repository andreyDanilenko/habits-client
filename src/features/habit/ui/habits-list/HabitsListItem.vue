<template>
  <div class="flex flex-col h-full">
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-start gap-3">
        <div
          class="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-white font-bold"
          :style="{ backgroundColor: habit.color || 'var(--color-primary-default)' }"
        >
          {{ habit.icon || '📝' }}
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-text-primary break-words">{{ habit.title }}</h3>
            <Badge v-if="displayOwnerName" variant="outline" class="text-xs">
              {{ displayOwnerName }}
            </Badge>
          </div>
          <p v-if="habit.description" class="text-sm text-text-secondary mt-1 line-clamp-1">
            {{ habit.description }}
          </p>
        </div>
      </div>
      <div class="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
        <div class="flex items-center space-x-1">
          <Button
            icon-only
            variant="icon"
            size="sm"
            icon-color="success"
            :left-icon="CheckIcon"
            @click.stop="$emit('mark-completion', habit)"
          />
          <Button
            v-if="canDelete"
            icon-only
            variant="icon"
            size="sm"
            icon-color="danger"
            :left-icon="DeleteIcon"
            @click.stop="$emit('delete', habit)"
          />
        </div>
      </div>
    </div>

    <div class="mt-auto">
      <ProgressBar
        :current="progress"
        :total="habit.dailyGoal || 1"
        :label="t('habits.list.progressToday')"
        :color="habit.color"
      />
    </div>

    <div class="flex items-center justify-between pt-4 border-t border-border-light">
      <div class="text-sm text-text-secondary">
        {{ t('habits.list.completionsToday', { count: progress }) }}
      </div>
      <div v-if="canEdit" class="flex items-center space-x-2">
        <Button variant="link" size="md" @click.stop="$emit('edit', habit)">
          {{ t('common.actions.edit') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useAppI18n } from '@/shared/lib/i18n'
  import { ProgressBar, Button, Badge } from '@/shared/ui'

  const { t } = useAppI18n()
  import type { Habit } from '@/entities/habit'
  import { CheckIcon, DeleteIcon } from '@/shared/ui/icon'
  import { useUserStore } from '@/entities/user'
  import { usePermissions } from '@/entities/workspace/lib/permissions'

  const props = defineProps<{
    habit: Habit
    progress: number
  }>()

  const userStore = useUserStore()
  const { isOwner } = usePermissions()
  const displayOwnerName = computed(() => {
    const n = props.habit.ownerName
    return n && n !== 'null' ? n : null
  })
  const canDelete = computed(
    () => props.habit.userId === userStore.currentUser?.id || isOwner.value,
  )
  const canEdit = computed(() => props.habit.userId === userStore.currentUser?.id)

  defineEmits<{
    edit: [habit: Habit]
    'mark-completion': [habit: Habit]
    delete: [habit: Habit]
  }>()
</script>
