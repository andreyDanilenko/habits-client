import { api, API_ENDPOINTS } from '@/shared/api'
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  AttachEntityToProjectDto,
  ProjectEntityType,
} from '../types/project'

export interface ProjectsListResponse {
  projects: Project[]
}

export interface ProjectEntityIdsResponse {
  entityIds: string[]
}

export interface EntityProjectIdsResponse {
  projectIds: string[]
}

export const projectService = {
  getList: async (workspaceId: string): Promise<Project[]> => {
    const data = await api.get<ProjectsListResponse>(API_ENDPOINTS.PROJECTS.LIST(workspaceId))
    return data.projects ?? []
  },

  getById: async (workspaceId: string, projectId: string): Promise<Project> => {
    return api.get<Project>(API_ENDPOINTS.PROJECTS.DETAIL(workspaceId, projectId))
  },

  create: async (workspaceId: string, data: CreateProjectDto): Promise<Project> => {
    return api.post<Project>(API_ENDPOINTS.PROJECTS.LIST(workspaceId), data)
  },

  update: async (
    workspaceId: string,
    projectId: string,
    data: UpdateProjectDto,
  ): Promise<Project> => {
    return api.put<Project>(API_ENDPOINTS.PROJECTS.DETAIL(workspaceId, projectId), data)
  },

  delete: async (workspaceId: string, projectId: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.PROJECTS.DETAIL(workspaceId, projectId))
  },

  /**
   * Список ID сущностей в проекте.
   * @param entityType — опционально: только контакты/компании/сделки (crm_contact, crm_company, crm_deal).
   */
  listEntityIds: async (
    workspaceId: string,
    projectId: string,
    entityType?: ProjectEntityType,
  ): Promise<string[]> => {
    const q = entityType ? `?entity_type=${encodeURIComponent(entityType)}` : ''
    const url = API_ENDPOINTS.PROJECTS.ENTITIES(workspaceId, projectId) + q
    const data = await api.get<ProjectEntityIdsResponse>(url)
    return data.entityIds ?? []
  },

  /** Привязать одну сущность к проекту. */
  attachEntity: async (
    workspaceId: string,
    projectId: string,
    dto: AttachEntityToProjectDto,
  ): Promise<void> => {
    await api.post(API_ENDPOINTS.PROJECTS.ENTITIES(workspaceId, projectId), dto)
  },

  /** Привязать несколько сущностей к проекту (несколько вызовов attach). */
  attachEntities: async (
    workspaceId: string,
    projectId: string,
    dtos: AttachEntityToProjectDto[],
  ): Promise<void> => {
    await Promise.all(dtos.map((dto) => projectService.attachEntity(workspaceId, projectId, dto)))
  },

  /** Отвязать сущность от проекта. */
  detachEntity: async (
    workspaceId: string,
    projectId: string,
    entityType: string,
    entityId: string,
  ): Promise<void> => {
    await api.delete(
      API_ENDPOINTS.PROJECTS.DETACH_ENTITY(workspaceId, projectId, entityType, entityId),
    )
  },

  /** Список ID проектов, к которым привязана сущность (для блока «Проекты» в карточке контакта/компании/сделки). */
  getProjectIdsForEntity: async (
    workspaceId: string,
    entityType: string,
    entityId: string,
  ): Promise<string[]> => {
    const data = await api.get<EntityProjectIdsResponse>(
      API_ENDPOINTS.PROJECTS.BY_ENTITY(workspaceId, entityType, entityId),
    )
    return data.projectIds ?? []
  },
}
