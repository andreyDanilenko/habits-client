import type { PermissionString } from '@/entities/role'

export const CRM_PERMISSIONS = {
  contactCreate: 'crm:contact:create' as PermissionString,
  companyCreate: 'crm:company:create' as PermissionString,
  dealCreate: 'crm:deal:create' as PermissionString,
} as const

