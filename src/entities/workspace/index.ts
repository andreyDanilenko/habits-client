export type {
  Workspace,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceModule,
  Member,
} from './types/workspace'

export { useWorkspaceStore } from './model/workspace-store'
export { workspaceService } from './api/workspace-service'
export {
  usePermissions,
  requirePermission,
  requireOwner,
  requireOwnerOrAdmin,
  requireWorkspace,
  requireModuleEnabled,
  WorkspacePermission,
} from './lib/permissions'
