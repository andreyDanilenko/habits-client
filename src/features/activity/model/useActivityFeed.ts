import { ref, computed, watch, reactive, type Ref } from 'vue'
import { activityService } from '@/entities/activity'
import {
  getActivityDateGroupKey,
  getActivityDateGroupLabel,
  getActivityDateGroupOrder,
  type ActivityDateGroupKey,
} from '@/shared/lib/date'
import type {
  Activity,
  ActivityEntityType,
  ActivityFilters,
  CreateNoteDto,
  CreateCallDto,
  UpdateNoteDto,
} from '@/entities/activity'

const DEFAULT_LIMIT = 20

export interface ActivityGroup {
  key: ActivityDateGroupKey
  label: string
  activities: Activity[]
}

export function useActivityFeed(
  workspaceId: Ref<string>,
  entityType: ActivityEntityType,
  entityId: Ref<string>,
) {
  const getWorkspaceId = () => workspaceId.value
  const getEntityId = () => entityId.value

  const activities = ref<Activity[]>([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(DEFAULT_LIMIT)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<ActivityFilters>({})

  const hasMore = computed(() => activities.value.length < total.value)
  const isEmpty = computed(() => !loading.value && activities.value && activities.value.length === 0)
  const hasFilters = computed(
    () =>
      (filters.value.types?.length ?? 0) > 0 ||
      !!filters.value.dateFrom ||
      !!filters.value.dateTo ||
      !!filters.value.importantOnly ||
      !!(filters.value.search?.trim()),
  )

  const grouped = computed((): ActivityGroup[] => {
    const order = getActivityDateGroupOrder()
    const byKey = new Map<ActivityDateGroupKey, Activity[]>()
    for (const a of activities.value) {
      const key = getActivityDateGroupKey(a.createdAt)
      if (!byKey.has(key)) byKey.set(key, [])
      byKey.get(key)!.push(a)
    }
    return order
      .filter((key) => byKey.has(key) && byKey.get(key)!.length > 0)
      .map((key) => ({
        key,
        label: getActivityDateGroupLabel(key),
        activities: byKey.get(key)!,
      }))
  })

  async function fetchPage(pageNum: number, append: boolean) {
    const ws = getWorkspaceId()
    const id = getEntityId()
    if (!ws || !id) return
    loading.value = true
    error.value = null
    try {
      const res = await activityService.getList(ws, {
        entityType,
        entityId: id,
        page: pageNum,
        limit: limit.value,
        filters: filters.value,
      })
      const data = res.data || []

      if (append) {
        activities.value = [...activities.value, ...data]
      } else {
        activities.value = data
      }
      total.value = res.total
      page.value = res.page
    } catch (e: unknown) {
      const message = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : null
      error.value = message ?? 'Не удалось загрузить активность.'
    } finally {
      loading.value = false
    }
  }

  function load() {
    return fetchPage(1, false)
  }

  function loadMore() {
    if (loading.value || !hasMore.value) return
    return fetchPage(page.value + 1, true)
  }

  function setFilters(f: ActivityFilters) {
    filters.value = f
    return load()
  }

  function refetch() {
    return load()
  }

  async function createNote(dto: CreateNoteDto) {
    const ws = getWorkspaceId()
    if (!ws) return
    error.value = null
    try {
      const created = await activityService.createNote(ws, dto)
      activities.value = [created, ...activities.value]
      total.value += 1
    } catch (e: unknown) {
      const message = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : null
      error.value = message ?? 'Не удалось создать заметку.'
      throw e
    }
  }

  async function createCall(dto: CreateCallDto) {
    const ws = getWorkspaceId()
    if (!ws) return
    error.value = null
    try {
      const created = await activityService.createCall(ws, dto)
      activities.value = [created, ...activities.value]
      total.value += 1
    } catch (e: unknown) {
      const message = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : null
      error.value = message ?? 'Не удалось записать звонок.'
      throw e
    }
  }

  async function toggleImportant(id: string) {
    const ws = getWorkspaceId()
    if (!ws) return
    try {
      const updated = await activityService.toggleImportant(ws, id)
      activities.value = activities.value.map((a) => (a.id === id ? updated : a))
    } catch {
      await refetch()
    }
  }

  async function updateNote(id: string, data: UpdateNoteDto) {
    const ws = getWorkspaceId()
    if (!ws) return
    try {
      const updated = await activityService.update(ws, id, data)
      activities.value = activities.value.map((a) => (a.id === id ? updated : a))
    } catch {
      await refetch()
    }
  }

  async function deleteNote(id: string) {
    const ws = getWorkspaceId()
    if (!ws) return
    try {
      await activityService.delete(ws, id)
      activities.value = activities.value.filter((a) => a.id !== id)
      total.value = Math.max(0, total.value - 1)
    } catch {
      await refetch()
    }
  }

  watch([workspaceId, entityId], () => {
    load()
  })

  return reactive({
    activities,
    total,
    page,
    limit,
    loading,
    error,
    filters,
    hasMore,
    isEmpty,
    hasFilters,
    grouped,
    load,
    loadMore,
    setFilters,
    refetch,
    createNote,
    createCall,
    toggleImportant,
    updateNote,
    deleteNote,
  })
}
