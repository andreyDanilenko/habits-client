export type {
  Workspace,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceModule,
} from './types/workspace'

export { useWorkspaceStore } from './model/workspace-store'
export { workspaceService } from './api/workspace-service'
export {
  usePermissions,
  requirePermission,
  requireOwner,
  requireOwnerOrAdmin,
  requireModuleEnabled,
  WorkspacePermission,
} from './lib/permissions'
