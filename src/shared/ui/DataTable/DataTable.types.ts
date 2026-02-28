import type { VNode } from 'vue'

export type SortOrder = 'asc' | 'desc'

export interface DataTableColumn<T> {
  id: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center'
  getValue: (row: T) => unknown
  render?: (value: unknown, row: T) => VNode | string
  cellClassName?: string
}

export interface DataTableProps<T> {
  title: string
  data: T[]
  columns: DataTableColumn<T>[]
  getRowId: (row: T) => string | number
  loading?: boolean
  error?: boolean
  emptyMessage?: string
  errorMessage?: string
  headerActions?: VNode | null
  footer?: VNode | null
  selectable?: boolean
  selectedIds?: Set<string | number>
  onSelect?: (id: string | number) => void
  onRowClick?: (row: T) => void
  onSelectAll?: () => void
  sortBy?: string | null
  sortOrder?: SortOrder
  onSort?: (columnId: string) => void
  rowActions?: (row: T) => VNode | null
  className?: string
}
