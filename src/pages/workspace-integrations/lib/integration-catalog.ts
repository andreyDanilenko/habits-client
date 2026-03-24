/**
 * Каталог интеграций воркспейса — основа для будущих подключений и UI.
 * Статусы: available | coming_soon | planned
 */
export type IntegrationCatalogStatus = 'available' | 'coming_soon' | 'planned'

export interface IntegrationCatalogItem {
  id: string
  name: string
  description: string
  status: IntegrationCatalogStatus
  /** Короткий тег для группировки в будущем */
  category: 'comms' | 'dev' | 'calendar' | 'storage' | 'automation' | 'crm'
}

export const WORKSPACE_INTEGRATION_CATALOG: IntegrationCatalogItem[] = [
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Личные уведомления по задачам и событиям через бота.',
    status: 'available',
    category: 'comms',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Входящие письма → CRM (активности, сделки/лиды).',
    status: 'coming_soon',
    category: 'crm',
  },
  {
    id: 'outlook',
    name: 'Outlook / Microsoft 365',
    description: 'Входящие письма → CRM (активности, сделки/лиды).',
    status: 'coming_soon',
    category: 'crm',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Issues и PR → задачи воркспейса (линки и статусы).',
    status: 'coming_soon',
    category: 'dev',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Командные уведомления и дайджесты по задачам и статусам.',
    status: 'coming_soon',
    category: 'comms',
  },
  {
    id: 'microsoft_teams',
    name: 'Microsoft Teams',
    description: 'Командные уведомления и упоминания по задачам и событиям.',
    status: 'planned',
    category: 'comms',
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Дедлайны задач → события календаря (push из ERP).',
    status: 'coming_soon',
    category: 'calendar',
  },
  {
    id: 'google_drive',
    name: 'Google Drive',
    description: 'Файлы сделок/задач → папки клиента и удобные ссылки.',
    status: 'coming_soon',
    category: 'storage',
  },
  {
    id: 'tilda_webforms',
    name: 'Tilda / Webforms',
    description: 'Заявки с форм сайта → лиды/сделки в CRM.',
    status: 'coming_soon',
    category: 'automation',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Создание встреч и ссылок на созвоны из задач/сделок.',
    status: 'planned',
    category: 'calendar',
  },
]

/** Заглушка: сюда позже подставят реальные обработчики подключения по id. */
export async function connectIntegrationStub(_id: string): Promise<void> {
  await Promise.resolve()
}
