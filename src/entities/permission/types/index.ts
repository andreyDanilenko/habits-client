export interface Permission {
  id: string
  moduleCode: string
  entityType: string
  action: string
  name: string
  isSystem: boolean
  createdAt: string
}

export type PermissionsCatalogResponse = Permission[]

export interface PermissionTreeModuleEntityAction {
  code: string
  name: string
  permission: Permission
  permissionString: string
}

export interface PermissionTreeEntity {
  code: string
  name: string
  actions: Record<string, PermissionTreeModuleEntityAction>
}

export interface PermissionTreeModule {
  code: string
  name: string
  entities: Record<string, PermissionTreeEntity>
}

export interface PermissionTree {
  modules: Record<string, PermissionTreeModule>
  flat: Permission[]
}

