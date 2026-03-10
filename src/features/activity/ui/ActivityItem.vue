<template>
  <div class="rounded-xl border border-border-default bg-bg-primary p-4 space-y-2">
    <div class="flex items-start gap-3">
      <span
        class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-bg-tertiary text-lg"
        :aria-label="activityTypeLabel"
      >
        {{ typeIcon }}
      </span>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-sm text-text-muted shrink-0">
            {{ formatTimeRu(activity.createdAt) }}
          </span>
          <span class="text-text-primary font-medium">{{ activity.title }}</span>
          <button
            v-if="activity.isImportant"
            type="button"
            class="text-warning-default shrink-0"
            aria-label="Важное"
          >
            ★
          </button>
          <div v-if="showActions" ref="menuContainerRef" class="ml-auto relative">
            <button
              type="button"
              class="p-1 rounded text-text-muted hover:bg-bg-tertiary hover:text-text-primary"
              aria-label="Действия"
              @click="menuOpen = !menuOpen"
            >
              ⋮
            </button>
            <div
              v-if="menuOpen"
              class="absolute right-0 top-full mt-1 py-1 rounded-lg border border-border-default bg-bg-primary shadow-lg z-10 min-w-[140px]"
            >
              <button
                type="button"
                class="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary"
                @click="handleToggleImportant"
              >
                {{ activity.isImportant ? 'Снять важность' : 'Пометить важным' }}
              </button>
              <button
                v-if="activity.isEditable && props.canEdit"
                type="button"
                class="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary"
                @click="handleEdit"
              >
                Редактировать
              </button>
              <button
                v-if="activity.isDeletable && props.canDelete"
                type="button"
                class="w-full px-3 py-2 text-left text-sm text-danger-default hover:bg-bg-tertiary"
                @click="handleDelete"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
        <p v-if="activity.description" class="text-sm text-text-secondary mt-1 whitespace-pre-wrap">
          {{ activity.description }}
        </p>
        <!-- Call metadata -->
        <div
          v-if="activity.type === 'call' && activity.metadata"
          class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted"
        >
          <span v-if="activity.metadata.callDirection">
            {{ activity.metadata.callDirection === 'in' ? 'Входящий' : 'Исходящий' }}
          </span>
          <span v-if="activity.metadata.callStatus">
            {{ callStatusLabel(activity.metadata.callStatus) }}
          </span>
          <span v-if="activity.metadata.callDuration != null">
            {{ formatDuration(activity.metadata.callDuration) }}
          </span>
        </div>
        <!-- Email metadata -->
        <div
          v-if="activity.type === 'email' && activity.metadata"
          class="mt-2 space-y-1 text-sm text-text-muted"
        >
          <p v-if="activity.metadata.emailSubject">Тема: {{ activity.metadata.emailSubject }}</p>
          <p v-if="activity.metadata.emailFrom">От: {{ activity.metadata.emailFrom }}</p>
          <p v-if="activity.metadata.emailTo?.length">
            Кому: {{ activity.metadata.emailTo.join(', ') }}
          </p>
        </div>
        <!-- Deal stage changed -->
        <div
          v-if="
            activity.type === 'deal_stage_changed' &&
            activity.metadata?.fromStage &&
            activity.metadata?.toStage
          "
          class="mt-2 text-sm text-text-muted"
        >
          {{ activity.metadata.fromStage.name }} → {{ activity.metadata.toStage.name }}
          <span
            v-if="activity.metadata.dealValue != null"
            class="ml-2 font-medium text-primary-default"
          >
            {{ formatMoney(activity.metadata.dealValue) }}
          </span>
        </div>
        <!-- Changed fields -->
        <ul
          v-if="activity.metadata?.changedFields?.length"
          class="mt-2 space-y-1 text-sm text-text-muted"
        >
          <li v-for="(cf, i) in activity.metadata.changedFields" :key="i">
            {{ cf.fieldLabel }}: {{ String(cf.oldValue) || '—' }} → {{ String(cf.newValue) || '—' }}
          </li>
        </ul>
        <!-- Files -->
        <ul v-if="activity.metadata?.files?.length" class="mt-2 space-y-1 text-sm">
          <li v-for="(f, i) in activity.metadata.files" :key="i">
            <a
              :href="f.url"
              target="_blank"
              rel="noopener"
              class="text-primary-default hover:underline"
            >
              📎 {{ f.name }}
            </a>
            <span class="text-text-muted ml-1">({{ formatFileSize(f.size) }})</span>
          </li>
        </ul>
        <div class="mt-2 flex items-center gap-2 text-sm text-text-muted">
          <span
            class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-default/10 text-primary-default text-xs font-medium"
          >
            {{ authorInitials }}
          </span>
          <span>{{ activity.createdBy.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { formatTimeRu } from '@/shared/lib/date'
  import type { Activity as ActivityType } from '@/entities/activity'

  const props = withDefaults(
    defineProps<{
      activity: ActivityType
      showActions?: boolean
      canEdit?: boolean
      canDelete?: boolean
    }>(),
    { showActions: true, canEdit: true, canDelete: true },
  )

  const emit = defineEmits<{
    toggleImportant: []
    edit: []
    delete: []
  }>()

  const menuOpen = ref(false)
  const menuContainerRef = ref<HTMLElement | null>(null)

  const typeIcon = computed(() => {
    const icons: Record<string, string> = {
      note: '📝',
      call: '📞',
      email: '✉️',
      task: '✅',
      deal_stage_changed: '🔄',
      contact_created: '✨',
      contact_updated: '✨',
      company_created: '✨',
      company_updated: '✨',
      deal_created: '✨',
      file_attached: '📎',
      message: '💬',
    }
    return icons[props.activity.type] ?? '•'
  })

  const activityTypeLabel = computed(() => {
    const labels: Record<string, string> = {
      note: 'Заметка',
      call: 'Звонок',
      email: 'Письмо',
      task: 'Задача',
      deal_stage_changed: 'Смена этапа',
      contact_created: 'Создание контакта',
      contact_updated: 'Изменение контакта',
      company_created: 'Создание компании',
      company_updated: 'Изменение компании',
      deal_created: 'Создание сделки',
      file_attached: 'Файл',
      message: 'Сообщение',
    }
    return labels[props.activity.type] ?? props.activity.type
  })

  const authorInitials = computed(() => {
    const name = props.activity.createdBy.name ?? ''
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase() || '?'
  })

  function callStatusLabel(status: string): string {
    const map: Record<string, string> = {
      answered: 'Дозвонился',
      missed: 'Не дозвонился',
      no_answer: 'Перезвонить позже',
    }
    return map[status] ?? status
  }

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} Б`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
  }

  function formatMoney(value: number): string {
    return (
      new Intl.NumberFormat('ru-RU', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value) + ' ₽'
    )
  }

  function handleClickOutside(e: MouseEvent) {
    if (
      menuOpen.value &&
      menuContainerRef.value &&
      !menuContainerRef.value.contains(e.target as Node)
    ) {
      menuOpen.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  function handleToggleImportant() {
    menuOpen.value = false
    emit('toggleImportant')
  }

  function handleEdit() {
    menuOpen.value = false
    emit('edit')
  }

  function handleDelete() {
    menuOpen.value = false
    emit('delete')
  }
</script>
