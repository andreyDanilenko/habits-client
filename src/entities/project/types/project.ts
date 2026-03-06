/**
 * Типы сущностей, которые можно привязывать к проектам.
 * Бэкенд принимает любую строку entity_type; список расширяется с появлением модулей (Tasks, HR).
 * См. features/projects/config/entityTypes.ts и docs/PROJECTS_SPEC.md.
 */
export const PROJECT_ENTITY_TYPES = {
  CRM_CONTACT: 'crm_contact',
  CRM_COMPANY: 'crm_company',
  CRM_DEAL: 'crm_deal',
} as const

export type ProjectEntityType = (typeof PROJECT_ENTITY_TYPES)[keyof typeof PROJECT_ENTITY_TYPES]

/** Для API можно передавать и будущие типы (task, hr_employee и т.д.). */
export type ProjectEntityTypeAny = string

export interface Project {
  id: string
  workspaceId: string
  name: string
  description?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateProjectDto {
  name: string
  description?: string | null
}

export interface UpdateProjectDto {
  name?: string
  description?: string | null
}

/** Привязка сущности модуля к проекту (backend: AttachEntityToProjectDto). */
export interface AttachEntityToProjectDto {
  entityType: ProjectEntityType
  entityId: string
}

/** Запись связи проект–сущность (для отображения, если API вернёт). */
export interface ProjectEntity {
  id: string
  projectId: string
  entityType: string
  entityId: string
  createdAt: string
}
