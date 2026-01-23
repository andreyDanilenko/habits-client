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
    MEMBERS: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/members`,
    SWITCH: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/switch`,
    MODULES: (workspaceId: string) => apiV1 + `/workspaces/${workspaceId}/modules`,
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
