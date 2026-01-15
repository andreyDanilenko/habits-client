export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  WORKSPACE: {
    BASE: '/workspaces',
    MEMBERS: (workspaceId: string) => `/workspaces/${workspaceId}/members`,
    SWITCH: (workspaceId: string) => `/workspaces/${workspaceId}/switch`,
    MODULES: (workspaceId: string) => `/workspaces/${workspaceId}/modules`,
  },

  HABITS: {
    BASE: '/habits',
    DETAIL: (id: string) => `/habits/${id}`,
    COMPLETE: (id: string) => `/habits/${id}/complete`,
    TOGGLE: (id: string) => `/habits/${id}/toggle`,
    STATS: (id: string) => `/habits/${id}/stats`,
    COMPLETIONS: '/habits/completions',
    CALENDAR: '/habits/calendar',
  },

  JOURNAL: {
    BASE: '/journal',
    BY_DATE: (date: string) => `/journal/${date}`,
  },
} as const
