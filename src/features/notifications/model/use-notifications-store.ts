import { ref, computed, watch } from 'vue'
import { useRealtime, type RealtimeEventType } from '@/shared/realtime'
import { useAuthStore } from '@/features/auth'
import { useWorkspaceStore } from '@/entities/workspace'
import { notificationService } from '../api/notification-service'

let realtimeSubscribed = false

export interface NotificationItem {
  id: string
  eventKey?: string
  eventType: RealtimeEventType
  title: string
  subtitle?: string
  timestamp: number
  read: boolean
}

function formatDealNotification(
  eventType: string,
  payload: unknown,
): { title: string; subtitle?: string } {
  const p = payload as {
    deal?: { name?: string }
    stageName?: string
    stageFromName?: string
    stageToName?: string
  }
  const deal = p?.deal
  const name = deal?.name ?? 'Сделка'

  switch (eventType) {
    case 'deal.created':
      return {
        title: `Сделка «${name}» создана`,
        subtitle: p.stageName ? `Этап: ${p.stageName}` : undefined,
      }
    case 'deal.updated':
      if (p.stageFromName && p.stageToName) {
        return {
          title: `Сделка «${name}» обновлена`,
          subtitle: `Перешла: ${p.stageFromName} → ${p.stageToName}`,
        }
      }
      if (p.stageName) {
        return {
          title: `Сделка «${name}» обновлена`,
          subtitle: `Этап: ${p.stageName}`,
        }
      }
      return { title: `Сделка «${name}» обновлена` }
    case 'deal.deleted':
      return { title: `Сделка «${name}» удалена` }
    default:
      return { title: `Сделка «${name}»` }
  }
}

function formatTaskNotification(
  eventType: string,
  payload: unknown,
): { title: string; subtitle?: string } {
  const p = payload as { task?: { title?: string } }
  const task = p?.task
  const title = task?.title ?? 'Задача'

  switch (eventType) {
    case 'task.created':
      return { title: `Задача «${title}» создана` }
    case 'task.updated':
      return { title: `Задача «${title}» обновлена` }
    case 'task.deleted':
      return { title: `Задача «${title}» удалена` }
    case 'task.completed':
      return { title: `Задача «${title}» выполнена` }
    case 'task.reopened':
      return { title: `Задача «${title}» снова в работе` }
    default:
      return { title: `Задача «${title}»` }
  }
}

function formatHabitNotification(
  eventType: string,
  payload: unknown,
): { title: string; subtitle?: string } {
  const p = payload as { habit?: { title?: string }; habitId?: string; title?: string }
  const habit = p?.habit
  const title = habit?.title ?? p?.title ?? 'Привычка'

  switch (eventType) {
    case 'habit.created':
      return { title: `Привычка «${title}» создана` }
    case 'habit.updated':
      return { title: `Привычка «${title}» обновлена` }
    case 'habit.deleted':
      return { title: `Привычка «${title}» удалена` }
    case 'habit.completed':
      return { title: `Привычка «${title}» выполнена`, subtitle: 'Отмечена как выполненная' }
    default:
      return { title: `Привычка «${title}»` }
  }
}

function formatInvitationNotification(
  _eventType: string,
  payload: unknown,
): { title: string; subtitle?: string } {
  const p = payload as { email?: string; role?: string }
  const email = p?.email ?? 'Пользователь'
  return {
    title: 'Приглашение принято',
    subtitle: `${email} присоединился к workspace`,
  }
}

function formatNotification(
  eventType: RealtimeEventType,
  payload: unknown,
): { title: string; subtitle?: string } {
  if (eventType.startsWith('deal.')) return formatDealNotification(eventType, payload)
  if (eventType.startsWith('habit.')) return formatHabitNotification(eventType, payload)
  if (eventType.startsWith('task.')) return formatTaskNotification(eventType, payload)
  if (eventType === 'invitation.accepted') return formatInvitationNotification(eventType, payload)
  return { title: 'Уведомление', subtitle: eventType }
}

function buildEventKey(eventType: RealtimeEventType, payload: unknown): string {
  const p = payload as Record<string, unknown>
  const deal = p?.deal as { id?: string } | undefined
  const habit = p?.habit as { id?: string } | undefined
  const habitId = p?.habitId as string | undefined
  const task = p?.task as { id?: string } | undefined
  const taskId = p?.taskId as string | undefined
  const workspaceId = p?.workspaceId as string | undefined
  const userId = p?.userId as string | undefined

  if (eventType.startsWith('deal.') && deal?.id) return `${eventType}:${deal.id}`
  if (eventType.startsWith('habit.')) {
    const id = habit?.id ?? habitId
    if (id) return `${eventType}:${id}`
  }
  if (eventType.startsWith('task.')) {
    const id = task?.id ?? taskId
    if (id) return `${eventType}:${id}`
  }
  if (eventType === 'invitation.accepted' && workspaceId && userId) {
    return `${eventType}:${workspaceId}:${userId}`
  }
  return `${eventType}:${Date.now()}`
}

function dtoToItem(d: {
  id: string
  eventKey?: string
  eventType: string
  title: string
  subtitle?: string
  createdAt: string
  readAt?: string
}): NotificationItem {
  return {
    id: d.id,
    eventKey: d.eventKey,
    eventType: d.eventType as RealtimeEventType,
    title: d.title,
    subtitle: d.subtitle,
    timestamp: new Date(d.createdAt).getTime(),
    read: !!d.readAt,
  }
}

const notifications = ref<NotificationItem[]>([])
const maxItems = 50
let fetchInFlight = false
let lastFetchTime = 0
const FETCH_DEBOUNCE_MS = 1000

export function useNotificationsStore() {
  const { on } = useRealtime()
  const authStore = useAuthStore()
  const workspaceStore = useWorkspaceStore()

  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)
  const items = computed(() => [...notifications.value])

  async function fetchFromApi() {
    if (!authStore.isAuthenticated) return
    if (fetchInFlight) return
    const now = Date.now()
    if (now - lastFetchTime < FETCH_DEBOUNCE_MS) return

    fetchInFlight = true
    lastFetchTime = now
    try {
      const { notifications: list } = await notificationService.list({
        limit: maxItems,
      })
      if (list?.length !== undefined) {
        notifications.value = list.map(dtoToItem)
      }
    } catch {
      // Оставляем текущий список при ошибке
    } finally {
      fetchInFlight = false
    }
  }

  function addNotification(eventType: RealtimeEventType, payload: unknown) {
    const { title, subtitle } = formatNotification(eventType, payload)
    const eventKey = buildEventKey(eventType, payload)
    const tempId = `temp-${eventKey}`

    const existing = notifications.value.find((n) => n.eventKey === eventKey || n.id === tempId)
    const item: NotificationItem = {
      id: existing?.id ?? tempId,
      eventKey,
      eventType,
      title,
      subtitle,
      timestamp: Date.now(),
      read: false,
    }

    if (existing) {
      notifications.value = [item, ...notifications.value.filter((n) => n !== existing)]
    } else {
      notifications.value = [item, ...notifications.value].slice(0, maxItems)
    }

    notificationService
      .create({
        channel: 'activity',
        eventType,
        eventKey,
        title,
        subtitle: subtitle || undefined,
        payload: payload as Record<string, unknown>,
        workspaceId: workspaceStore.currentWorkspace?.id,
      })
      .then((created) => {
        const match = notifications.value.find((n) => n.eventKey === eventKey || n.id === tempId)
        if (match) {
          const updated = dtoToItem(created)
          notifications.value = [updated, ...notifications.value.filter((n) => n !== match)]
        }
      })
      .catch(() => {})
  }

  async function markAsRead(id: string) {
    const n = notifications.value.find((x) => x.id === id)
    if (n) n.read = true
    if (id.startsWith('temp-')) return
    try {
      await notificationService.markRead(id)
    } catch {
      if (n) n.read = false
    }
  }

  async function markAllAsRead() {
    notifications.value.forEach((n) => (n.read = true))
    try {
      await notificationService.markAllRead()
    } catch {
      notifications.value.forEach((n) => (n.read = false))
    }
  }

  if (!realtimeSubscribed) {
    realtimeSubscribed = true
    const eventTypes: RealtimeEventType[] = [
      'habit.created',
      'habit.updated',
      'habit.deleted',
      'habit.completed',
      'deal.created',
      'deal.updated',
      'deal.deleted',
      'task.created',
      'task.updated',
      'task.deleted',
      'task.completed',
      'task.reopened',
      'invitation.accepted',
    ]
    eventTypes.forEach((et) => on(et, (payload) => addNotification(et, payload)))
  }

  watch(
    () => authStore.isAuthenticated,
    (authenticated) => {
      if (authenticated) {
        void fetchFromApi()
      } else {
        notifications.value = []
      }
    },
    { immediate: true },
  )

  return { notifications: items, unreadCount, markAsRead, markAllAsRead, fetchFromApi }
}
