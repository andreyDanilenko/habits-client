import { ref, computed } from 'vue'

export function useCompaniesTableState() {
  const page = ref(1)
  const pageSize = ref(20)
  const sortBy = ref<string | null>('createdAt')
  const sortOrder = ref<'asc' | 'desc'>('desc')
  const selectedIds = ref<Set<string>>(new Set())

  const handleSort = (columnId: string) => {
    if (sortBy.value === columnId) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = columnId
      sortOrder.value = 'asc'
    }
    page.value = 1
  }

  const handleRowSelect = (id: string | number) => {
    const strId = String(id)
    const next = new Set(selectedIds.value)
    if (next.has(strId)) next.delete(strId)
    else next.add(strId)
    selectedIds.value = next
  }

  const handleSelectAll = (ids: (string | number)[]) => {
    if (ids.length === 0) return
    const allSelected = ids.every((id) => selectedIds.value.has(String(id)))
    selectedIds.value = allSelected ? new Set() : new Set(ids.map(String))
  }

  const setPage = (p: number) => {
    page.value = Math.max(1, p)
  }

  const clearSelection = () => {
    selectedIds.value = new Set()
  }

  return {
    page,
    pageSize,
    sortBy,
    sortOrder,
    selectedIds: computed(() => selectedIds.value),
    handleSort,
    handleRowSelect,
    handleSelectAll,
    setPage,
    clearSelection,
  }
}
