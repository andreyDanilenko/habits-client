import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

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

/**
 * Форматирует дату с русской локалью
 */
export function formatDateRu(date: Date | string, formatStr: string = 'd MMMM yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (!dateObj || isNaN(dateObj.getTime())) return ''
  return format(dateObj, formatStr, { locale: ru })
}

/**
 * Форматирует дату и время с русской локалью
 */
export function formatDateTimeRu(date: Date | string): string {
  return formatDateRu(date, 'd MMMM yyyy, HH:mm')
}

/**
 * Форматирует только время
 */
export function formatTimeRu(date: Date | string): string {
  return formatDateRu(date, 'HH:mm')
}

/**
 * Форматирует дату для отображения (сегодня, вчера, дата)
 */
export function formatDateDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (!dateObj || isNaN(dateObj.getTime())) return ''
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())
  
  if (dateOnly.getTime() === today.getTime()) {
    return 'Сегодня'
  }
  if (dateOnly.getTime() === yesterday.getTime()) {
    return 'Вчера'
  }
  
  return formatDateRu(dateObj, 'd MMMM yyyy')
}

/**
 * Форматирует относительное время (только что, N мин назад, и т.д.)
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (!dateObj || isNaN(dateObj.getTime())) return ''
  
  const now = new Date()
  const diff = now.getTime() - dateObj.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (minutes < 1) return 'только что'
  if (minutes < 60) return `${minutes} мин назад`
  if (hours < 24) return `${hours} ч назад`
  if (days < 7) return `${days} дн назад`
  
  return formatDateRu(dateObj, 'd MMMM yyyy, HH:mm')
}

/**
 * Получает приветствие в зависимости от времени суток
 */
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 4 && hour < 12) return 'Доброе утро'
  if (hour >= 12 && hour < 18) return 'Добрый день'
  if (hour >= 18 && hour < 22) return 'Добрый вечер'
  return 'Доброй ночи'
}
