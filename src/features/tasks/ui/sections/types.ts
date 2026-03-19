export interface LinkedTask {
  /** ID записи связи (для удаления) */
  linkId: string
  /** ID связанной задачи (для перехода) */
  id: string
  title: string
  priority: string
  linkType: 'blocks' | 'blocked_by'
}
