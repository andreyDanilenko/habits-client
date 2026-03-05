export interface KanbanColumnModel<TItem = unknown> {
  id: string
  title: string
  color?: string
  items: TItem[]
  meta?: Record<string, unknown>
}

export interface KanbanBoardProps<TItem = unknown> {
  columns: KanbanColumnModel<TItem>[]
  itemKey?: string | ((item: TItem) => string)
  dndGroup?: string
  disabled?: boolean
}

export interface KanbanCardContext<TItem = unknown> {
  item: TItem
  columnId: string
}
