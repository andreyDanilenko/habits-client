import { format } from 'date-fns'
import { enUS, ru } from 'date-fns/locale'
import { i18n } from '@/shared/lib/i18n'

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
  if (minutes < 60) {
    if (minutes === 1) return 'минуту назад'
    if (minutes >= 2 && minutes <= 4) return `${minutes} минуты назад`
    return `${minutes} мин назад`
  }
  if (hours < 24) {
    if (hours === 1) return 'час назад'
    if (hours >= 2 && hours <= 4) return `${hours} часа назад`
    return `${hours} ч назад`
  }
  if (days < 7) {
    if (days === 1) return 'вчера'
    if (days >= 2 && days <= 4) return `${days} дня назад`
    return `${days} дн назад`
  }

  return formatDateRu(dateObj, 'd MMMM yyyy, HH:mm')
}

export function getTextPreview(text: string, maxLength: number = 150): string {
  if (!text) return ''
  return text.replace(/[#*_`[\]]/g, '').substring(0, maxLength)
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 4 && hour < 12) return 'Доброе утро'
  if (hour >= 12 && hour < 18) return 'Добрый день'
  if (hour >= 18 && hour < 22) return 'Добрый вечер'
  return 'Доброй ночи'
}

/** Ключ группы для ленты активности: сегодня, вчера, на этой неделе, в прошлом месяце, старше */
export type ActivityDateGroupKey = 'today' | 'yesterday' | 'this_week' | 'last_month' | 'older'

const ACTIVITY_GROUP_ORDER: ActivityDateGroupKey[] = [
  'today',
  'yesterday',
  'this_week',
  'last_month',
  'older',
]

export function getActivityDateGroupKey(date: Date | string): ActivityDateGroupKey {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (!dateObj || isNaN(dateObj.getTime())) return 'older'
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())
  const dayDiff = Math.floor((today.getTime() - dateOnly.getTime()) / (24 * 60 * 60 * 1000))
  if (dayDiff === 0) return 'today'
  if (dayDiff === 1) return 'yesterday'
  if (dayDiff <= 7) return 'this_week'
  if (dayDiff <= 31) return 'last_month'
  return 'older'
}

export function getActivityDateGroupLabel(key: ActivityDateGroupKey): string {
  const labels: Record<ActivityDateGroupKey, string> = {
    today: 'Сегодня',
    yesterday: 'Вчера',
    this_week: 'На этой неделе',
    last_month: 'В прошлом месяце',
    older: 'Старше',
  }
  return labels[key]
}

export function getActivityDateGroupOrder(): ActivityDateGroupKey[] {
  return [...ACTIVITY_GROUP_ORDER]
}

/** Дата в формате date-fns с локалью из текущего языка приложения */
export function formatDateWithAppLocale(date: Date | string, pattern: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (!dateObj || isNaN(dateObj.getTime())) return ''
  const loc = i18n.global.locale.value === 'en' ? enUS : ru
  return format(dateObj, pattern, { locale: loc })
}

/** Относительное время с строками из vue-i18n */
export function formatRelativeTimeI18n(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (!dateObj || isNaN(dateObj.getTime())) return ''

  const t = i18n.global.t
  const now = new Date()
  const diff = now.getTime() - dateObj.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return t('common.relativeTime.justNow')
  if (minutes < 60) {
    if (minutes === 1) return t('common.relativeTime.oneMinuteAgo')
    return t('common.relativeTime.minutesAgo', { n: minutes })
  }
  if (hours < 24) {
    if (hours === 1) return t('common.relativeTime.oneHourAgo')
    return t('common.relativeTime.hoursAgo', { n: hours })
  }
  if (days < 7) {
    if (days === 1) return t('common.relativeTime.yesterday')
    return t('common.relativeTime.daysAgo', { n: days })
  }

  return formatDateWithAppLocale(dateObj, 'd MMMM yyyy, HH:mm')
}
