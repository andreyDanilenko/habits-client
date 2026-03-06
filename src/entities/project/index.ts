export type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  AttachEntityToProjectDto,
  ProjectEntity,
  ProjectEntityType,
} from './types/project'
export { PROJECT_ENTITY_TYPES } from './types/project'
export { projectService } from './api/project-service'
export type {
  ProjectsListResponse,
  ProjectEntityIdsResponse,
  EntityProjectIdsResponse,
} from './api/project-service'
