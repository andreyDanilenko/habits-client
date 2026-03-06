import type { CompanyAddress } from '@/entities/company'

export function formatCompanyAddress(addr: CompanyAddress | undefined): string {
  if (!addr) return '—'
  const parts = [addr.country, addr.city, addr.street, addr.building, addr.apartment].filter(
    Boolean,
  )
  return parts.join(', ') || '—'
}
