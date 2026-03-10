const apiV1 = '/api/v1'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: apiV1 + '/auth/login',
    REGISTER: apiV1 + '/auth/register',
    LOGOUT: apiV1 + '/auth/logout',
    REFRESH: apiV1 + '/auth/refresh',
    ME: apiV1 + '/auth/me',
  },

  WORKSPACE: {
    BASE: apiV1 + '/workspaces',
    CURRENT: apiV1 + '/workspaces/current',
    MY_LICENSES: apiV1 + '/workspaces/me/module-licenses',
    MEMBERS: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/members`,
    MEMBER: (workspaceId: string, userId: string) =>
      apiV1 + `/workspaces/${workspaceId}/members/${userId}`,
    SWITCH: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/switch`,
    MODULES: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/modules`,
    MODULE: (workspaceId: string, moduleCode: string) =>
      apiV1 + `/workspaces/${workspaceId}/modules/${moduleCode}`,
    NOTES: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/notes`,
    NOTE: (workspaceId: string, noteId: string) =>
      apiV1 + `/workspaces/${workspaceId}/notes/${noteId}`,
    JOURNAL: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/journal`,
    JOURNAL_ENTRY: (workspaceId: string, entryId: string) =>
      apiV1 + `/workspaces/${workspaceId}/journal/${entryId}`,
    CURRENCIES: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/currencies`,
    CURRENCY: (workspaceId: string, id: string) =>
      apiV1 + `/workspaces/${workspaceId}/currencies/${id}`,
    COUNTERPARTIES: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/counterparties`,
    COUNTERPARTY: (workspaceId: string, id: string) =>
      apiV1 + `/workspaces/${workspaceId}/counterparties/${id}`,
  },

  /** Только для пользователей с глобальной ролью ADMIN. Иначе 403. */
  ADMIN: {
    WORKSPACES: apiV1 + '/admin/workspaces',
    USERS: apiV1 + '/admin/users',
    USER: (id: string) => apiV1 + `/admin/users/${id}`,
    USER_LICENSES: (userId: string) => apiV1 + `/admin/users/${userId}/licenses`,
  },

  CRM: {
    CONTACTS: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/contacts`,
    CONTACT: (workspaceId: string, id: string) =>
      apiV1 + `/workspaces/${workspaceId}/contacts/${id}`,
    COMPANIES: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/companies`,
    COMPANY: (workspaceId: string, id: string) =>
      apiV1 + `/workspaces/${workspaceId}/companies/${id}`,
    COMPANY_ATTACH_CONTACT: (workspaceId: string, companyId: string, contactId: string) =>
      apiV1 + `/workspaces/${workspaceId}/companies/${companyId}/contacts/${contactId}`,
    COMPANY_DETACH_CONTACT: (workspaceId: string, companyId: string, contactId: string) =>
      apiV1 + `/workspaces/${workspaceId}/companies/${companyId}/contacts/${contactId}`,
    DEALS: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/deals`,
    DEAL: (workspaceId: string, id: string) => apiV1 + `/workspaces/${workspaceId}/deals/${id}`,
    PIPELINES: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/pipelines`,
    PIPELINE: (workspaceId: string, pipelineId: string) =>
      apiV1 + `/workspaces/${workspaceId}/pipelines/${pipelineId}`,
    PIPELINE_STAGES: (workspaceId: string, pipelineId: string) =>
      apiV1 + `/workspaces/${workspaceId}/pipelines/${pipelineId}/stages`,
    PIPELINE_STAGE: (workspaceId: string, pipelineId: string, stageId: string) =>
      apiV1 + `/workspaces/${workspaceId}/pipelines/${pipelineId}/stages/${stageId}`,
    PIPELINE_STAGES_REORDER: (workspaceId: string, pipelineId: string) =>
      apiV1 + `/workspaces/${workspaceId}/pipelines/${pipelineId}/stages/reorder`,
    ACTIVITIES: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/activities`,
    ACTIVITY: (workspaceId: string, id: string) =>
      apiV1 + `/workspaces/${workspaceId}/activities/${id}`,
    ACTIVITY_IMPORTANT: (workspaceId: string, id: string) =>
      apiV1 + `/workspaces/${workspaceId}/activities/${id}/important`,
  },

  PROJECTS: {
    LIST: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/projects`,
    DETAIL: (workspaceId: string, projectId: string) =>
      apiV1 + `/workspaces/${workspaceId}/projects/${projectId}`,
    ENTITIES: (workspaceId: string, projectId: string) =>
      apiV1 + `/workspaces/${workspaceId}/projects/${projectId}/entities`,
    DETACH_ENTITY: (workspaceId: string, projectId: string, entityType: string, entityId: string) =>
      apiV1 + `/workspaces/${workspaceId}/projects/${projectId}/entities/${entityType}/${entityId}`,
    BY_ENTITY: (workspaceId: string, entityType: string, entityId: string) =>
      apiV1 + `/workspaces/${workspaceId}/entities/${entityType}/${entityId}/projects`,
  },

  HABITS: {
    BASE: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/habits`,
    DETAIL: (workspaceId: string, habitsId: string) =>
      apiV1 + `/workspaces/${workspaceId}/habits/${habitsId}`,
    COMPLETE: (workspaceId: string, habitsId: string) =>
      apiV1 + `/workspaces/${workspaceId}/habits/${habitsId}/complete`,
    TOGGLE: (workspaceId: string, habitsId: string) =>
      apiV1 + `/workspaces/${workspaceId}/habits/${habitsId}/toggle`,
    STATS: (workspaceId: string, habitsId: string) =>
      apiV1 + `/workspaces/${workspaceId}/habits/${habitsId}/stats`,
    COMPLETIONS: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/habits/completions`,
    CALENDAR: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/habits/calendar`,
    ACTIVITIES: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/habits/activities`,
  },

  PERMISSIONS: {
    CATALOG: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/permissions/catalog`,
    SYSTEM_ROLES: (workspaceId: string) =>
      apiV1 + `/workspaces/${workspaceId}/permissions/system-roles`,
  },

  ROLES: {
    LIST: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/roles`,
    DETAIL: (workspaceId: string, roleId: string) =>
      apiV1 + `/workspaces/${workspaceId}/roles/${roleId}`,
    PERMISSIONS: (workspaceId: string, roleId: string) =>
      apiV1 + `/workspaces/${workspaceId}/roles/${roleId}/permissions`,
    INHERIT: (workspaceId: string, roleId: string, parentRoleId: string) =>
      apiV1 + `/workspaces/${workspaceId}/roles/${roleId}/inherit/${parentRoleId}`,
  },

  ASSIGNMENTS: {
    USER_ROLES: (workspaceId: string, userId: string) =>
      apiV1 + `/workspaces/${workspaceId}/users/${userId}/roles`,
    USER_ROLE: (workspaceId: string, userId: string, roleId: string) =>
      apiV1 + `/workspaces/${workspaceId}/users/${userId}/roles/${roleId}`,
    USER_PERMISSIONS: (workspaceId: string, userId: string) =>
      apiV1 + `/workspaces/${workspaceId}/users/${userId}/permissions`,
    USER_PERMISSION: (workspaceId: string, userId: string, permissionId: string) =>
      apiV1 + `/workspaces/${workspaceId}/users/${userId}/permissions/${permissionId}`,
  },

  ME: {
    PERMISSIONS: (workspaceId: string) => apiV1 + `/me/permissions?workspaceId=${workspaceId}`,
  },
} as const
