import { formatDateRu } from '@/shared/lib'
import type { Contact } from '@/entities/contact'

export function contactDisplayName(contact: Contact): string {
  const n = [contact.firstName, contact.lastName].filter(Boolean).join(' ')
  return n || contact.emails?.[0]?.address || contact.id
}

export function phoneTypeLabel(type: string): string {
  return { mobile: 'Мобильный', work: 'Рабочий', home: 'Домашний' }[type] ?? type
}

export function formatContactDate(iso: string | undefined): string {
  if (!iso) return '—'
  return formatDateRu(iso, 'd MMMM yyyy')
}
