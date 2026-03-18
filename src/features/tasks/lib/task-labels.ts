export function priorityClass(priority: string): string {
  const map: Record<string, string> = {
    low: 'bg-bg-tertiary text-text-secondary',
    medium: 'bg-info-light text-info-default',
    high: 'bg-warning-light text-warning-default',
    critical: 'bg-error-light text-error-default',
  }
  return map[priority] ?? map.medium
}

export function priorityLabel(priority: string): string {
  const map: Record<string, string> = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    critical: 'Критический',
  }
  return map[priority] ?? priority
}

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
