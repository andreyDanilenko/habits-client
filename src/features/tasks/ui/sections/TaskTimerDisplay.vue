<template>
  <div
    v-if="canEdit"
    class="flex items-center gap-(--spacing-2) text-(--text-xs) text-text-secondary"
  >
    <ClockIcon class="size-4 shrink-0 text-text-muted" />
    <span
      :class="[
        'tabular-nums',
        timerRunning ? 'font-medium text-primary-default' : '',
      ]"
    >
      {{ formatTimeHMS(displaySeconds) }}
    </span>
    <button
      type="button"
      :class="[
        'inline-flex items-center justify-center w-7 h-7 rounded transition-colors shrink-0',
        timerRunning ? 'text-primary-default hover:bg-primary-default/10' : 'text-primary-default hover:bg-primary-default/10',
      ]"
      :disabled="timeSaving"
      :title="timerRunning ? 'Остановить' : 'Старт'"
      @click="handleToggle"
    >
      <StopIcon v-if="timerRunning" class="size-4" />
      <PlayIcon v-else class="size-4" />
    </button>
  </div>
  <span
    v-else
    class="flex items-center gap-1 text-(--text-xs) text-text-secondary tabular-nums"
  >
    <ClockIcon class="size-4 shrink-0 text-text-muted" />
    {{ formatTimeHMS(taskTotalSeconds) }}
  </span>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onUnmounted } from 'vue'
  import { ClockIcon, StopIcon, PlayIcon } from '@/shared/ui/icon'

  const TASK_TIMER_STORAGE_KEY = 'task_active_timer'

  const props = defineProps<{
    taskTotalSeconds: number
    canEdit?: boolean
    timeSaving?: boolean
    workspaceId: string
    taskId: string | null
  }>()

  // Временно отключено: emit вызывает цепочку событий и циклы в production
  // const emit = defineEmits<{ addTime: [seconds: number] }>()

  const timerRunning = ref(false)
  const timerBaseSeconds = ref(0)
  const timerStart = ref<number>(0)
  const timerElapsedSeconds = ref(0)
  let timerInterval: ReturnType<typeof setInterval> | null = null

  const displaySeconds = computed(() => {
    if (timerRunning.value) {
      return timerBaseSeconds.value + timerElapsedSeconds.value
    }
    return props.taskTotalSeconds
  })

  function formatTimeHMS(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return [h, m, s].map((n) => n.toString().padStart(2, '0')).join(':')
  }

  function saveActiveTimerToStorage(taskId?: string | null) {
    const id = taskId ?? props.taskId
    if (!id || !props.workspaceId) return
    try {
      localStorage.setItem(
        TASK_TIMER_STORAGE_KEY,
        JSON.stringify({
          workspaceId: props.workspaceId,
          taskId: id,
          startTime: timerStart.value,
          baseSeconds: timerBaseSeconds.value,
        }),
      )
    } catch {
      /* ignore */
    }
  }

  function clearActiveTimerFromStorage() {
    try {
      localStorage.removeItem(TASK_TIMER_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }

  // Временно отключено — может вызывать циклы
  // function loadActiveTimerForTask(): boolean { ... }

  function stopInterval() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  watch(
    () => [props.taskId, props.workspaceId],
    ([taskId, workspaceId], oldVal) => {
      const [prevTaskId] = oldVal ?? []
      if (!taskId || !workspaceId) {
        stopInterval()
        timerRunning.value = false
        return
      }
      if (prevTaskId !== taskId) {
        if (timerRunning.value && prevTaskId) {
          saveActiveTimerToStorage(prevTaskId)
        }
        stopInterval()
        timerRunning.value = false
        // Временно отключено: loadActiveTimerForTask() может вызывать циклы
        // loadActiveTimerForTask()
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    if (timerRunning.value) saveActiveTimerToStorage()
    stopInterval()
  })

  function stopAndSave() {
    if (timerRunning.value) {
      stopInterval()
      timerRunning.value = false
      clearActiveTimerFromStorage()
      timerElapsedSeconds.value = 0
      // Временно отключено: не вызываем emit('addTime') — вызывает циклы
      // if (elapsedSec > 0) emit('addTime', elapsedSec)
    }
  }

  function handleToggle() {
    if (timerRunning.value) {
      stopAndSave()
    } else {
      timerBaseSeconds.value = props.taskTotalSeconds
      timerStart.value = Date.now()
      timerElapsedSeconds.value = 0
      timerRunning.value = true
      timerInterval = setInterval(() => {
        timerElapsedSeconds.value = Math.floor((Date.now() - timerStart.value) / 1000)
      }, 1000)
      saveActiveTimerToStorage()
    }
  }

  defineExpose({ stopAndSave })
</script>
