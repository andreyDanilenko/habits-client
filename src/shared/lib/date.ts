/**
 * Получает локальную дату в формате YYYY-MM-DD без конвертации в UTC
 * Это важно для корректной работы с часовыми поясами - дата должна быть
 * такой, какую видит пользователь в своем часовом поясе
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Форматирует дату в локальном часовом поясе
 * Используется для получения даты, которую видит пользователь
 */
export function formatLocalDate(date: Date): string {
  return getLocalDateString(date)
}
