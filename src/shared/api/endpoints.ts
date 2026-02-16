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

  HABITS: {
    BASE: apiV1 + '/habits',
    DETAIL: (id: string) => apiV1 + `/habits/${id}`,
    COMPLETE: (id: string) => apiV1 + `/habits/${id}/complete`,
    TOGGLE: (id: string) => apiV1 + `/habits/${id}/toggle`,
    STATS: (id: string) => apiV1 + `/habits/${id}/stats`,
    COMPLETIONS: apiV1 + '/habits/completions',
    CALENDAR: apiV1 + '/habits/calendar',
  },

  JOURNAL: {
    BASE: apiV1 + '/journal',
    BY_DATE: (date: string) => apiV1 + `/journal/${date}`,
  },
} as const
