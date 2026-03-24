const apiV1 = '/api/v1'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: apiV1 + '/auth/login',
    REGISTER: apiV1 + '/auth/register',
    VERIFY_EMAIL: apiV1 + '/auth/verify-email',
    LOGOUT: apiV1 + '/auth/logout',
    REFRESH: apiV1 + '/auth/refresh',
    ME: apiV1 + '/auth/me',
    ME_AVATAR: apiV1 + '/auth/me/avatar',
    CHANGE_PASSWORD: apiV1 + '/auth/change-password',
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
    INVITATIONS: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/invitations`,
    INVITATION: (workspaceId: string, invitationId: string) =>
      apiV1 + `/workspaces/${workspaceId}/invitations/${invitationId}`,
    LOGO: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/logo`,
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

  /** Публичные эндпоинты (без auth или с опциональным auth) */
  PUBLIC: {
    INVITATION: (token: string) => apiV1 + `/public/invitations/${token}`,
    INVITATION_ACCEPT: (token: string) => apiV1 + `/public/invitations/${token}/accept`,
  },

  /** Только для пользователей с глобальной ролью ADMIN. Иначе 403. */
  ADMIN: {
    WORKSPACES: apiV1 + '/admin/workspaces',
    WORKSPACE: (id: string) => apiV1 + `/admin/workspaces/${id}`,
    WORKSPACE_MODULES: (workspaceId: string) => apiV1 + `/admin/workspaces/${workspaceId}/modules`,
    WORKSPACE_MODULE: (workspaceId: string, moduleCode: string) =>
      apiV1 + `/admin/workspaces/${workspaceId}/modules/${moduleCode}`,
    USERS: apiV1 + '/admin/users',
    MODULES: apiV1 + '/admin/modules',
    USER: (id: string) => apiV1 + `/admin/users/${id}`,
    USER_BAN: (id: string) => apiV1 + `/admin/users/${id}/ban`,
    USER_UNBAN: (id: string) => apiV1 + `/admin/users/${id}/unban`,
    USER_LICENSES: (userId: string) => apiV1 + `/admin/users/${userId}/licenses`,
    USER_LICENSE: (userId: string, licenseId: string) =>
      apiV1 + `/admin/users/${userId}/licenses/${licenseId}`,
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

  TASKS: {
    LIST: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/tasks`,
    DETAIL: (workspaceId: string, taskId: string) =>
      apiV1 + `/workspaces/${workspaceId}/tasks/${taskId}`,
    COMPLETE: (workspaceId: string, taskId: string) =>
      apiV1 + `/workspaces/${workspaceId}/tasks/${taskId}/complete`,
    REOPEN: (workspaceId: string, taskId: string) =>
      apiV1 + `/workspaces/${workspaceId}/tasks/${taskId}/reopen`,
    COMMENTS: (workspaceId: string, taskId: string) =>
      apiV1 + `/workspaces/${workspaceId}/tasks/${taskId}/comments`,
    COMMENT: (workspaceId: string, taskId: string, commentId: string) =>
      apiV1 + `/workspaces/${workspaceId}/tasks/${taskId}/comments/${commentId}`,
    LINKS: (workspaceId: string, taskId: string) =>
      apiV1 + `/workspaces/${workspaceId}/tasks/${taskId}/links`,
    LINK: (workspaceId: string, taskId: string, linkId: string) =>
      apiV1 + `/workspaces/${workspaceId}/tasks/${taskId}/links/${linkId}`,
    ATTACHMENTS: (workspaceId: string, taskId: string) =>
      apiV1 + `/workspaces/${workspaceId}/tasks/${taskId}/attachments`,
    ATTACHMENT: (workspaceId: string, taskId: string, attachmentId: string) =>
      apiV1 + `/workspaces/${workspaceId}/tasks/${taskId}/attachments/${attachmentId}`,
    ATTACHMENT_DOWNLOAD: (workspaceId: string, taskId: string, attachmentId: string) =>
      apiV1 + `/workspaces/${workspaceId}/tasks/${taskId}/attachments/${attachmentId}/download`,
    ATTACHMENT_PREVIEW_TOKEN: (workspaceId: string, taskId: string, attachmentId: string) =>
      apiV1 +
      `/workspaces/${workspaceId}/tasks/${taskId}/attachments/${attachmentId}/preview-token`,
    ACTIVITIES: (workspaceId: string, taskId: string) =>
      apiV1 + `/workspaces/${workspaceId}/tasks/${taskId}/activities`,
    ACTIVITIES_COUNT: (workspaceId: string, taskId: string) =>
      apiV1 + `/workspaces/${workspaceId}/tasks/${taskId}/activities/count`,
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
    OBJECT_SCOPES: (workspaceId: string, roleId: string) =>
      apiV1 + `/workspaces/${workspaceId}/roles/${roleId}/object-scopes`,
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
    NOTIFICATIONS: apiV1 + '/me/notifications',
    NOTIFICATION_READ: (id: string) => apiV1 + `/me/notifications/${id}/read`,
    NOTIFICATIONS_MARK_ALL_READ: apiV1 + '/me/notifications/mark-all-read',
  },

  INTEGRATIONS: {
    TELEGRAM_LINK: apiV1 + '/integrations/telegram/link',
  },
} as const
