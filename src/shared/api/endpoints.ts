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
    DEALS: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/deals`,
    DEAL: (workspaceId: string, id: string) =>
      apiV1 + `/workspaces/${workspaceId}/deals/${id}`,
    PIPELINES: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/pipelines`,
    ACTIVITIES: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/activities`,
    ACTIVITY: (workspaceId: string, id: string) =>
      apiV1 + `/workspaces/${workspaceId}/activities/${id}`,
    ACTIVITY_IMPORTANT: (workspaceId: string, id: string) =>
      apiV1 + `/workspaces/${workspaceId}/activities/${id}/important`,
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
  },
} as const
