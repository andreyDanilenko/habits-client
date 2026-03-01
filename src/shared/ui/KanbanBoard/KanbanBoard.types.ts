/**
 * Универсальные типы для канбан-доски.
 * Не привязаны к сделкам/задачам — можно переиспользовать в любом модуле.
 */

export interface KanbanColumnModel<TItem = unknown> {
  id: string
  title: string
  /** Опционально: цвет колонки (бордер/заголовок) */
  color?: string
  /** Элементы колонки (карточки) */
  items: TItem[]
  /** Опционально: метаданные для отображения (например, сумма, лимит) */
  meta?: Record<string, unknown>
}

export interface KanbanBoardProps<TItem = unknown> {
  columns: KanbanColumnModel<TItem>[]
  /** Ключ элемента для DnD (id поля или функция) */
  itemKey?: string | ((item: TItem) => string)
  /** Имя группы DnD (одинаковое для всех колонок при перетаскивании между ними) */
  dndGroup?: string
  /** Заблокировать перетаскивание */
  disabled?: boolean
}

export interface KanbanCardContext<TItem = unknown> {
  item: TItem
  columnId: string
}
