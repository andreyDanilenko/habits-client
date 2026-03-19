/** CSS-классы для приоритета задачи */
export function priorityClass(priority: string): string {
  const map: Record<string, string> = {
    low: 'bg-bg-tertiary text-text-secondary',
    medium: 'bg-info-light text-info-default',
    high: 'bg-warning-light text-warning-default',
    critical: 'bg-error-light text-error-default',
  }
  return map[priority] ?? map.medium
}

/** Подпись приоритета */
export function priorityLabel(priority: string): string {
  const map: Record<string, string> = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    critical: 'Критический',
  }
  return map[priority] ?? priority
}

/** CSS-классы для статуса задачи */
export function statusClass(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-bg-tertiary text-text-secondary',
    in_progress: 'bg-info-light text-info-default',
    completed: 'bg-success-light text-success-default',
    cancelled: 'bg-bg-tertiary text-text-muted',
  }
  return map[status] ?? map.pending
}

/** Подпись статуса */
export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'К выполнению',
    in_progress: 'В работе',
    completed: 'Выполнена',
    cancelled: 'Отменена',
  }
  return map[status] ?? status
}

/** CSS-классы для типа задачи */
export function typeClass(_type: string): string {
  return 'bg-bg-tertiary text-text-secondary'
}

/** Подпись типа задачи */
export function typeLabel(type: string): string {
  const map: Record<string, string> = {
    task: 'Задача',
    bug: 'Ошибка',
    feature: 'Функция',
    meeting: 'Встреча',
    call: 'Звонок',
    email: 'Email',
    lunch: 'Обед',
    other: 'Другое',
  }
  return map[type] ?? type
}
