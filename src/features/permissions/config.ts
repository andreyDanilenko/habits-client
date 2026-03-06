import type { PermissionString } from '@/entities/role'

export const CRM_PERMISSIONS = {
  contactCreate: 'crm:contact:create' as PermissionString,
  contactRead: 'crm:contact:read' as PermissionString,
  contactUpdate: 'crm:contact:update' as PermissionString,
  contactDelete: 'crm:contact:delete' as PermissionString,
  companyCreate: 'crm:company:create' as PermissionString,
  companyRead: 'crm:company:read' as PermissionString,
  companyUpdate: 'crm:company:update' as PermissionString,
  companyDelete: 'crm:company:delete' as PermissionString,
  dealCreate: 'crm:deal:create' as PermissionString,
  dealRead: 'crm:deal:read' as PermissionString,
  dealUpdate: 'crm:deal:update' as PermissionString,
  dealDelete: 'crm:deal:delete' as PermissionString,
  dealMove: 'crm:deal:move' as PermissionString,
  activityCreate: 'crm:activity:create' as PermissionString,
  activityRead: 'crm:activity:read' as PermissionString,
  activityUpdate: 'crm:activity:update' as PermissionString,
  activityDelete: 'crm:activity:delete' as PermissionString,
  pipelineManage: 'crm:pipeline:manage' as PermissionString,
  exportDeals: 'crm:export:deals' as PermissionString,
} as const

export const PROJECT_PERMISSIONS = {
  projectCreate: 'projects:project:create' as PermissionString,
  projectRead: 'projects:project:read' as PermissionString,
  projectUpdate: 'projects:project:update' as PermissionString,
  projectDelete: 'projects:project:delete' as PermissionString,
  entityAttach: 'projects:entity:attach' as PermissionString,
  entityDetach: 'projects:entity:detach' as PermissionString,
} as const
