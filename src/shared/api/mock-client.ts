interface MockLoginDto {
  email: string
  password: string
}

interface MockRegisterDto {
  email: string
  password: string
  name?: string
}

interface MockAuthResponse {
  accessToken: string
  refreshToken: string
  user?: {
    id: string
    email: string
    name?: string
  }
}

enum MockUserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

interface MockUser {
  id: string
  email: string
  name?: string
  role: MockUserRole
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

interface MockHabit {
  id: string
  title: string
  description?: string
  color: string
  icon?: string
  targetDays?: number
  dailyGoal?: number
  preferredTime?: string
  category?: string
  userId: string
  workspaceId: string
  createdAt: string
  updatedAt: string
}

interface MockHabitCompletion {
  id: string
  habitId: string
  userId: string
  date: string
  notes?: string
  rating?: number
  time?: string
  createdAt: string
}

interface MockWorkspace {
  id: string
  name: string
  description?: string
  color?: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

// Моковые данные
const MOCK_USER: MockUser = {
  id: '1',
  email: 'user@example.com',
  name: 'Test User',
  role: MockUserRole.USER,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
const MOCK_HABITS: MockHabit[] = [
  {
    id: '1',
    title: 'Утренняя зарядка',
    description: '15 минут упражнений каждое утро',
    color: '#3B82F6',
    icon: '💪',
    targetDays: 7,
    userId: '1',
    workspaceId: '1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Чтение книги',
    description: 'Читать минимум 30 минут в день',
    color: '#10B981',
    icon: '📚',
    targetDays: 5,
    userId: '1',
    workspaceId: '1',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Медитация',
    description: '10 минут медитации перед сном',
    color: '#8B5CF6',
    icon: '🧘',
    targetDays: 7,
    userId: '1',
    workspaceId: '1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const MOCK_COMPLETIONS: MockHabitCompletion[] = [
  {
    id: '1',
    habitId: '1',
    userId: '1',
    date: new Date().toISOString().split('T')[0],
    notes: 'Отличная тренировка!',
    rating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    habitId: '2',
    userId: '1',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    habitId: '1',
    userId: '1',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

interface MockContact {
  id: string
  firstName: string
  lastName: string
  phones: { type: string; number: string; isPrimary: boolean }[]
  emails: { type: string; address: string; isPrimary: boolean }[]
  companyId?: string
  position?: string
  tags: string[]
  ownerId: string
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
}

function buildMockContact(overrides: Partial<MockContact> & { id: string }): MockContact {
  const now = new Date().toISOString()
  return {
    firstName: '',
    lastName: '',
    phones: [],
    emails: [],
    tags: [],
    ownerId: '1',
    createdBy: '1',
    updatedBy: '1',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

const MOCK_CONTACTS: MockContact[] = [
  buildMockContact({
    id: 'c1',
    firstName: 'Иван',
    lastName: 'Петров',
    phones: [{ type: 'mobile', number: '+7 (999) 123-45-67', isPrimary: true }],
    emails: [{ type: 'work', address: 'ivan@example.com', isPrimary: true }],
    companyId: 'co1',
    position: 'Директор',
    tags: ['важный'],
  }),
  buildMockContact({
    id: 'c2',
    firstName: 'Мария',
    lastName: 'Сидорова',
    phones: [{ type: 'work', number: '+7 (495) 111-22-33', isPrimary: true }],
    emails: [{ type: 'work', address: 'maria@company.ru', isPrimary: true }],
    companyId: 'co1',
    tags: [],
  }),
  buildMockContact({
    id: 'c3',
    firstName: 'Алексей',
    lastName: 'Козлов',
    phones: [{ type: 'mobile', number: '+7 (916) 555-00-00', isPrimary: true }],
    emails: [{ type: 'personal', address: 'alex@gmail.com', isPrimary: true }],
    tags: ['лид'],
  }),
]

interface MockCompanyAddress {
  country: string
  city: string
  street: string
  building: string
  apartment?: string
}

interface MockCompany {
  id: string
  name: string
  inn?: string
  kpp?: string
  ogrn?: string
  phone?: string
  email?: string
  website?: string
  legalAddress?: MockCompanyAddress
  actualAddress?: MockCompanyAddress
  contacts: string[]
  tags: string[]
  ownerId: string
  createdAt: string
  updatedAt: string
}

interface MockStage {
  id: string
  name: string
  order: number
  color?: string
  probability: number
  isFinal: boolean
  isLost: boolean
}

interface MockPipeline {
  id: string
  name: string
  stages: MockStage[]
  isDefault: boolean
}

/** Мок сделки — соответствует Deal (одна сущность для списка и канбана) */
interface MockDeal {
  id: string
  name: string
  contactId?: string
  companyId?: string
  budget: number
  currency: 'RUB' | 'USD' | 'EUR'
  pipelineId: string
  stageId: string
  expectedCloseDate?: string
  actualCloseDate?: string
  status: 'open' | 'won' | 'lost'
  lostReason?: string
  description?: string
  source?: string
  probability?: number
  tags: string[]
  ownerId: string
  createdAt: string
  updatedAt: string
}

const MOCK_PIPELINES: MockPipeline[] = [
  {
    id: 'pl1',
    name: 'Основные продажи',
    isDefault: true,
    stages: [
      {
        id: 'st1',
        name: 'Лиды',
        order: 1,
        probability: 10,
        isFinal: false,
        isLost: false,
        color: '#94A3B8',
      },
      {
        id: 'st2',
        name: 'Переговоры',
        order: 2,
        probability: 50,
        isFinal: false,
        isLost: false,
        color: '#3B82F6',
      },
      {
        id: 'st3',
        name: 'Согласование',
        order: 3,
        probability: 80,
        isFinal: false,
        isLost: false,
        color: '#8B5CF6',
      },
      {
        id: 'st4',
        name: 'Выигрыш',
        order: 4,
        probability: 100,
        isFinal: true,
        isLost: false,
        color: '#22C55E',
      },
      {
        id: 'st5',
        name: 'Проигрыш',
        order: 5,
        probability: 0,
        isFinal: false,
        isLost: true,
        color: '#EF4444',
      },
    ],
  },
  {
    id: 'pl2',
    name: 'Воронка B2B',
    isDefault: false,
    stages: [
      {
        id: 'stb1',
        name: 'Квалификация',
        order: 1,
        probability: 5,
        isFinal: false,
        isLost: false,
        color: '#F59E0B',
      },
      {
        id: 'stb2',
        name: 'Демо',
        order: 2,
        probability: 40,
        isFinal: false,
        isLost: false,
        color: '#06B6D4',
      },
      {
        id: 'stb3',
        name: 'Оффер',
        order: 3,
        probability: 90,
        isFinal: false,
        isLost: false,
        color: '#10B981',
      },
    ],
  },
]

const now = new Date()
const isoNow = now.toISOString()
const isoPast = (d: Date) => d.toISOString()

const MOCK_DEALS: MockDeal[] = [
  {
    id: 'd1',
    name: 'Поставка оборудования',
    contactId: 'c1',
    companyId: 'co1',
    budget: 500000,
    currency: 'RUB',
    pipelineId: 'pl1',
    stageId: 'st2',
    expectedCloseDate: isoPast(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)),
    status: 'open',
    probability: 50,
    description: 'Поставка серверного оборудования для дата-центра',
    source: 'Сайт',
    tags: ['крупный', 'оборудование'],
    ownerId: '1',
    createdAt: isoPast(new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)),
    updatedAt: isoNow,
  },
  {
    id: 'd2',
    name: 'Консультация по внедрению',
    contactId: 'c3',
    budget: 50000,
    currency: 'RUB',
    pipelineId: 'pl1',
    stageId: 'st1',
    status: 'open',
    probability: 10,
    source: 'Звонок',
    tags: [],
    ownerId: '1',
    createdAt: isoPast(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)),
    updatedAt: isoNow,
  },
  {
    id: 'd3',
    name: 'Лицензии на ПО',
    contactId: 'c1',
    companyId: 'co1',
    budget: 1200000,
    currency: 'RUB',
    pipelineId: 'pl1',
    stageId: 'st3',
    expectedCloseDate: isoPast(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)),
    status: 'open',
    probability: 80,
    source: 'Рекомендация',
    tags: ['важный', 'повторный'],
    ownerId: '1',
    createdAt: isoPast(new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)),
    updatedAt: isoNow,
  },
  {
    id: 'd4',
    name: 'Интеграция с 1С',
    companyId: 'co1',
    budget: 350000,
    currency: 'RUB',
    pipelineId: 'pl2',
    stageId: 'stb2',
    status: 'open',
    probability: 40,
    description: 'Настройка обмена данными',
    source: 'Сайт',
    tags: ['интеграция'],
    ownerId: '1',
    createdAt: isoPast(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)),
    updatedAt: isoNow,
  },
  {
    id: 'd11',
    name: 'B2B: Корпоративная лицензия',
    companyId: 'co1',
    budget: 890000,
    currency: 'RUB',
    pipelineId: 'pl2',
    stageId: 'stb1',
    status: 'open',
    probability: 5,
    source: 'Сайт',
    tags: ['b2b'],
    ownerId: '1',
    createdAt: isoPast(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)),
    updatedAt: isoNow,
  },
  {
    id: 'd12',
    name: 'B2B: Внедрение CRM',
    contactId: 'c2',
    companyId: 'co1',
    budget: 1200000,
    currency: 'RUB',
    pipelineId: 'pl2',
    stageId: 'stb3',
    status: 'open',
    probability: 90,
    source: 'Рекомендация',
    tags: ['b2b', 'крупный'],
    ownerId: '1',
    createdAt: isoPast(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
    updatedAt: isoNow,
  },
  {
    id: 'd5',
    name: 'Аудит безопасности',
    contactId: 'c2',
    companyId: 'co1',
    budget: 180000,
    currency: 'RUB',
    pipelineId: 'pl1',
    stageId: 'st2',
    expectedCloseDate: isoPast(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)),
    status: 'open',
    probability: 50,
    source: 'Звонок',
    tags: ['срочно'],
    ownerId: '1',
    createdAt: isoPast(new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)),
    updatedAt: isoNow,
  },
  {
    id: 'd6',
    name: 'Подписка на облако',
    contactId: 'c3',
    budget: 24000,
    currency: 'RUB',
    pipelineId: 'pl1',
    stageId: 'st4',
    expectedCloseDate: isoPast(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)),
    actualCloseDate: isoNow,
    status: 'won',
    probability: 100,
    tags: [],
    ownerId: '1',
    createdAt: isoPast(new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)),
    updatedAt: isoNow,
  },
  {
    id: 'd7',
    name: 'Разработка мобильного приложения',
    companyId: 'co2',
    budget: 2500000,
    currency: 'RUB',
    pipelineId: 'pl1',
    stageId: 'st1',
    status: 'open',
    probability: 10,
    description: 'Кроссплатформенное приложение',
    source: 'Сайт',
    tags: ['крупный', 'мобильное'],
    ownerId: '1',
    createdAt: isoPast(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)),
    updatedAt: isoNow,
  },
  {
    id: 'd8',
    name: 'Обучение сотрудников',
    contactId: 'c1',
    companyId: 'co1',
    budget: 85000,
    currency: 'RUB',
    pipelineId: 'pl1',
    stageId: 'st2',
    expectedCloseDate: isoPast(new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)),
    status: 'open',
    probability: 60,
    source: 'Рекомендация',
    tags: ['обучение'],
    ownerId: '1',
    createdAt: isoPast(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)),
    updatedAt: isoNow,
  },
  {
    id: 'd9',
    name: 'Техподдержка годовая',
    contactId: 'c2',
    budget: 120000,
    currency: 'RUB',
    pipelineId: 'pl1',
    stageId: 'st3',
    status: 'open',
    probability: 85,
    tags: ['подписка'],
    ownerId: '1',
    createdAt: isoPast(new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000)),
    updatedAt: isoNow,
  },
  {
    id: 'd10',
    name: 'Не состоявшаяся сделка',
    budget: 100000,
    currency: 'RUB',
    pipelineId: 'pl1',
    stageId: 'st5',
    status: 'lost',
    lostReason: 'Выбрали конкурента',
    tags: [],
    ownerId: '1',
    createdAt: isoPast(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)),
    updatedAt: isoNow,
  },
]

const MOCK_COMPANIES: MockCompany[] = [
  {
    id: 'co1',
    name: 'ООО Ромашка',
    inn: '7707123456',
    phone: '+7 (495) 111-22-33',
    email: 'info@romashka.ru',
    contacts: ['c1', 'c2'],
    tags: ['ключевой'],
    ownerId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'co2',
    name: 'ИП Козлов',
    phone: '+7 (916) 555-00-00',
    contacts: ['c3'],
    tags: [],
    ownerId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

/** Мок активности — соответствует Activity (лента по контакту/компании/сделке) */
interface MockActivity {
  id: string
  type: string
  entityType: 'contact' | 'company' | 'deal'
  entityId: string
  title: string
  description?: string
  metadata?: Record<string, unknown>
  isImportant?: boolean
  createdBy: { id: string; name: string; avatar?: string }
  createdAt: string
  isEditable?: boolean
  isDeletable?: boolean
}

const mockActivityKey = (entityType: string, entityId: string) => `${entityType}_${entityId}`

function buildMockActivitiesSeed(): Record<string, MockActivity[]> {
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const yesterday = new Date(todayStart)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(todayStart)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const createdBy = { id: '1', name: 'Анна Менеджер' }
  return {
    contact_c1: [
      {
        id: 'act_c1_1',
        type: 'call',
        entityType: 'contact',
        entityId: 'c1',
        title: 'Исходящий звонок',
        metadata: {
          callDuration: 315,
          callDirection: 'out',
          callStatus: 'answered',
        },
        createdBy,
        createdAt: new Date(
          todayStart.getTime() + 10 * 60 * 60 * 1000 + 23 * 60 * 1000,
        ).toISOString(),
        isImportant: true,
      },
      {
        id: 'act_c1_2',
        type: 'note',
        entityType: 'contact',
        entityId: 'c1',
        title: 'Договорились о встрече',
        description: 'На следующей неделе обсудим условия.',
        createdBy,
        createdAt: yesterday.toISOString(),
        isEditable: true,
        isDeletable: true,
      },
      {
        id: 'act_c1_3',
        type: 'contact_created',
        entityType: 'contact',
        entityId: 'c1',
        title: 'Создание контакта',
        createdBy,
        createdAt: weekAgo.toISOString(),
      },
    ],
    company_co1: [
      {
        id: 'act_co1_1',
        type: 'note',
        entityType: 'company',
        entityId: 'co1',
        title: 'Запросили КП',
        description: 'Отправили коммерческое предложение на почту.',
        createdBy,
        createdAt: todayStart.toISOString(),
        isEditable: true,
        isDeletable: true,
      },
      {
        id: 'act_co1_2',
        type: 'company_updated',
        entityType: 'company',
        entityId: 'co1',
        title: 'Обновление реквизитов',
        metadata: {
          changedFields: [
            { field: 'phone', fieldLabel: 'Телефон', oldValue: '', newValue: '+7 (495) 111-22-33' },
          ],
        },
        createdBy,
        createdAt: yesterday.toISOString(),
      },
    ],
    deal_d1: [
      {
        id: 'act_d1_1',
        type: 'deal_stage_changed',
        entityType: 'deal',
        entityId: 'd1',
        title: 'Этап изменён',
        metadata: {
          fromStage: { id: 'st1', name: 'Лиды' },
          toStage: { id: 'st2', name: 'Переговоры' },
          dealValue: 500000,
        },
        createdBy,
        createdAt: new Date(todayStart.getTime() + 9 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'act_d1_2',
        type: 'call',
        entityType: 'deal',
        entityId: 'd1',
        title: 'Входящий звонок',
        metadata: {
          callDuration: 120,
          callDirection: 'in',
          callStatus: 'answered',
        },
        createdBy,
        createdAt: weekAgo.toISOString(),
        isImportant: true,
      },
    ],
  }
}

const MOCK_ACTIVITIES_STORE: Record<string, MockActivity[]> = buildMockActivitiesSeed()

const MOCK_WORKSPACES: MockWorkspace[] = [
  {
    id: '1',
    name: 'Личные привычки',
    description: 'Мои личные цели и привычки',
    color: '#3B82F6',
    ownerId: '1',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Работа',
    description: 'Профессиональное развитие',
    color: '#10B981',
    ownerId: '1',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Имитация задержки сети
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms))
const apiV1 = '/api/v1'

class MockApiClient {
  async get<T>(url: string): Promise<T> {
    await delay()

    // Мок для получения текущего пользователя
    if (url === apiV1 + '/auth/me') {
      const token = localStorage.getItem('accessToken')
      if (!token || !token.startsWith('mock-')) {
        throw { response: { status: 401, data: { message: 'Unauthorized' } } }
      }
      return MOCK_USER as T
    }

    // Мок для привычек
    if (url === apiV1 + '/habits' || url.startsWith(apiV1 + '/habits?')) {
      return { habits: MOCK_HABITS } as T
    }

    // Мок для завершений привычек
    if (url.startsWith(apiV1 + '/habits/completions')) {
      return { completions: MOCK_COMPLETIONS } as T
    }

    // Мок для workspace (список)
    if (url === apiV1 + '/workspaces') {
      return { workspaces: MOCK_WORKSPACES } as T
    }

    // Мок для текущего workspace (для CRM и канбана)
    if (url === apiV1 + '/workspaces/current') {
      const first = MOCK_WORKSPACES[0]
      return (first ? { workspace: first } : { workspace: null }) as T
    }

    // Мок для контактов CRM: GET /workspaces/:id/contacts
    const contactsMatch = url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/contacts(\\?|$)`))
    if (contactsMatch) {
      const parsed = new URL(url, 'http://_')
      const search = parsed.searchParams.get('search')?.toLowerCase() ?? ''
      const companyId = parsed.searchParams.get('companyId') ?? ''
      const page = Math.max(1, parseInt(parsed.searchParams.get('page') ?? '1', 10))
      const limit = Math.min(
        100,
        Math.max(1, parseInt(parsed.searchParams.get('limit') ?? '20', 10)),
      )
      const sortBy = parsed.searchParams.get('sortBy') ?? 'createdAt'
      const sortOrder = parsed.searchParams.get('sortOrder') ?? 'desc'
      let list = [...MOCK_CONTACTS]
      if (companyId) {
        list = list.filter((c) => c.companyId === companyId)
      }
      if (search) {
        list = list.filter(
          (c) =>
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(search) ||
            c.emails.some((e) => e.address.toLowerCase().includes(search)) ||
            c.phones.some((p) => p.number.replace(/\D/g, '').includes(search.replace(/\D/g, ''))),
        )
      }
      const total = list.length
      const byField = (a: MockContact, b: MockContact) => {
        const av = (a as any)[sortBy] ?? ''
        const bv = (b as any)[sortBy] ?? ''
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
        return sortOrder === 'asc' ? cmp : -cmp
      }
      list.sort(byField)
      const start = (page - 1) * limit
      const contacts = list.slice(start, start + limit)
      return { contacts, total } as T
    }

    // GET /workspaces/:id/contacts/:id
    const contactDetailMatch = url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/contacts/([^/]+)$`))
    if (contactDetailMatch) {
      const id = contactDetailMatch[1]
      const contact = MOCK_CONTACTS.find((c) => c.id === id)
      if (contact) return contact as T
      throw { response: { status: 404, data: { message: 'Contact not found' } } }
    }

    // GET /workspaces/:id/companies
    const companiesListMatch = url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/companies(\\?|$)`))
    if (companiesListMatch) {
      const parsed = new URL(url, 'http://_')
      const search = parsed.searchParams.get('search')?.toLowerCase() ?? ''
      const page = Math.max(1, parseInt(parsed.searchParams.get('page') ?? '1', 10))
      const limit = Math.min(
        100,
        Math.max(1, parseInt(parsed.searchParams.get('limit') ?? '20', 10)),
      )
      const sortBy = parsed.searchParams.get('sortBy') ?? 'createdAt'
      const sortOrder = parsed.searchParams.get('sortOrder') ?? 'desc'
      let list = [...MOCK_COMPANIES]
      if (search) {
        list = list.filter(
          (c) =>
            c.name.toLowerCase().includes(search) ||
            c.email?.toLowerCase().includes(search) ||
            c.inn?.includes(search),
        )
      }
      const total = list.length
      const byField = (a: MockCompany, b: MockCompany) => {
        const av = (a as any)[sortBy] ?? ''
        const bv = (b as any)[sortBy] ?? ''
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
        return sortOrder === 'asc' ? cmp : -cmp
      }
      list.sort(byField)
      const start = (page - 1) * limit
      const companies = list.slice(start, start + limit)
      return { companies, total } as T
    }

    // GET /workspaces/:id/companies/:id
    const companyDetailMatch = url.match(
      new RegExp(`^${apiV1}/workspaces/[^/]+/companies/([^/]+)$`),
    )
    if (companyDetailMatch) {
      const id = companyDetailMatch[1]
      const company = MOCK_COMPANIES.find((c) => c.id === id)
      if (company) return company as T
      throw { response: { status: 404, data: { message: 'Company not found' } } }
    }

    // GET /workspaces/:id/pipelines
    if (url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/pipelines$`))) {
      return { pipelines: MOCK_PIPELINES } as T
    }

    // GET /workspaces/:id/deals — одна и та же выборка для списка и канбана (фильтр pipelineId, dateFrom, dateTo)
    const dealsListMatch = url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/deals(\\?|$)`))
    if (dealsListMatch) {
      const parsed = new URL(url, 'http://_')
      const page = Math.max(1, parseInt(parsed.searchParams.get('page') ?? '1', 10))
      const limit = Math.min(
        500,
        Math.max(1, parseInt(parsed.searchParams.get('limit') ?? '20', 10)),
      )
      const sortBy = parsed.searchParams.get('sortBy') ?? 'createdAt'
      const sortOrder = parsed.searchParams.get('sortOrder') ?? 'desc'
      const pipelineId = parsed.searchParams.get('pipelineId') ?? ''
      const companyId = parsed.searchParams.get('companyId') ?? ''
      const dateFrom = parsed.searchParams.get('dateFrom') ?? ''
      const dateTo = parsed.searchParams.get('dateTo') ?? ''

      let list = [...MOCK_DEALS]
      if (pipelineId) {
        list = list.filter((d) => d.pipelineId === pipelineId)
      }
      if (companyId) {
        list = list.filter((d) => d.companyId === companyId)
      }
      if (dateFrom) {
        list = list.filter((d) => d.createdAt >= dateFrom)
      }
      if (dateTo) {
        const toEnd = dateTo.length <= 10 ? dateTo + 'T23:59:59.999Z' : dateTo
        list = list.filter((d) => d.createdAt <= toEnd)
      }

      const total = list.length
      const byField = (a: MockDeal, b: MockDeal) => {
        const av = (a as any)[sortBy] ?? ''
        const bv = (b as any)[sortBy] ?? ''
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
        return sortOrder === 'asc' ? cmp : -cmp
      }
      list.sort(byField)
      const start = (page - 1) * limit
      const deals = list.slice(start, start + limit)
      return { deals, total } as T
    }

    // GET /workspaces/:id/deals/:id
    const dealDetailMatch = url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/deals/([^/]+)$`))
    if (dealDetailMatch) {
      const id = dealDetailMatch[1]
      const deal = MOCK_DEALS.find((d) => d.id === id)
      if (deal) return deal as T
      throw { response: { status: 404, data: { message: 'Deal not found' } } }
    }

    // GET /workspaces/:id/activities?entityType=...&entityId=...&page=...&limit=...&types=...&dateFrom=...&dateTo=...&importantOnly=...&search=...
    const activitiesListMatch = url.match(
      new RegExp(`^${apiV1}/workspaces/[^/]+/activities(\\?|$)`),
    )
    if (activitiesListMatch) {
      const parsed = new URL(url, 'http://_')
      const entityType = parsed.searchParams.get('entityType') ?? ''
      const entityId = parsed.searchParams.get('entityId') ?? ''
      const page = Math.max(1, parseInt(parsed.searchParams.get('page') ?? '1', 10))
      const limit = Math.min(
        100,
        Math.max(1, parseInt(parsed.searchParams.get('limit') ?? '20', 10)),
      )
      const typesStr = parsed.searchParams.get('types') ?? ''
      const types = typesStr ? typesStr.split(',') : []
      const dateFrom = parsed.searchParams.get('dateFrom') ?? ''
      const dateTo = parsed.searchParams.get('dateTo') ?? ''
      const importantOnly = parsed.searchParams.get('importantOnly') === 'true'
      const search = (parsed.searchParams.get('search') ?? '').toLowerCase()

      const key = mockActivityKey(entityType, entityId)
      let list = [...(MOCK_ACTIVITIES_STORE[key] ?? [])]
      if (types.length) {
        list = list.filter((a) => types.includes(a.type))
      }
      if (dateFrom) {
        list = list.filter((a) => a.createdAt >= dateFrom)
      }
      if (dateTo) {
        const toEnd = dateTo.length <= 10 ? dateTo + 'T23:59:59.999Z' : dateTo
        list = list.filter((a) => a.createdAt <= toEnd)
      }
      if (importantOnly) {
        list = list.filter((a) => a.isImportant)
      }
      if (search) {
        list = list.filter(
          (a) =>
            a.title.toLowerCase().includes(search) ||
            (a.description?.toLowerCase().includes(search) ?? false),
        )
      }
      list.sort((a, b) => (b.createdAt < a.createdAt ? -1 : 1))
      const total = list.length
      const start = (page - 1) * limit
      const data = list.slice(start, start + limit)
      return { data, total, page, limit } as T
    }

    // По умолчанию возвращаем пустой массив
    return [] as T
  }

  async post<T>(url: string, data?: any): Promise<T> {
    await delay(800) // Больше задержка для POST запросов

    // Мок для логина
    if (url === apiV1 + '/auth/login') {
      const { email, password } = data as MockLoginDto

      if (!email || !password) {
        throw { response: { status: 400, data: { message: 'Email and password required' } } }
      }

      const response: MockAuthResponse = {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        user: {
          ...MOCK_USER,
          email,
        },
      }
      return response as T
    }

    // Мок для регистрации
    if (url === apiV1 + '/auth/register') {
      const { email, password } = data as MockRegisterDto

      if (!email || !password) {
        throw { response: { status: 400, data: { message: 'Email and password required' } } }
      }

      const response: MockAuthResponse = {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        user: {
          ...MOCK_USER,
          email,
          name: data.name || MOCK_USER.name,
        },
      }
      return response as T
    }

    // Мок для логаута
    if (url === apiV1 + '/auth/logout') {
      return {} as T
    }

    // Мок для refresh токена
    if (url === apiV1 + '/auth/refresh') {
      const newAccessToken = 'mock-access-token-' + Date.now()
      const response: MockAuthResponse = {
        accessToken: newAccessToken,
        refreshToken: data.refreshToken || 'mock-refresh-token-' + Date.now(),
      }
      return response as T
    }

    // Мок для создания привычки
    if (url === apiV1 + '/habits') {
      return {
        id: 'mock-habit-' + Date.now(),
        ...data,
        userId: '1',
        workspaceId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as T
    }

    // Мок для переключения выполнения привычки
    if (url.includes(apiV1 + '/habits/') && url.includes('/toggle')) {
      return {
        id: 'mock-completion-' + Date.now(),
        habitId: url.split('/')[2],
        userId: '1',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      } as T
    }

    // POST /workspaces/:id/companies
    if (url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/companies$`))) {
      const now = new Date().toISOString()
      const newCompany: MockCompany = {
        id: 'mock-company-' + Date.now(),
        name: data?.name ?? '',
        inn: data?.inn,
        kpp: data?.kpp,
        ogrn: data?.ogrn,
        phone: data?.phone,
        email: data?.email,
        website: data?.website,
        legalAddress: data?.legalAddress,
        actualAddress: data?.actualAddress,
        contacts: [],
        tags: data?.tags ?? [],
        ownerId: data?.ownerId ?? '1',
        createdAt: now,
        updatedAt: now,
      }
      MOCK_COMPANIES.push(newCompany)
      return newCompany as T
    }

    // POST /workspaces/:id/deals
    if (url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/deals$`))) {
      const now = new Date().toISOString()
      const firstStage = MOCK_PIPELINES[0]?.stages[0]?.id ?? 'st1'
      const newDeal: MockDeal = {
        id: 'mock-deal-' + Date.now(),
        name: data?.name ?? '',
        contactId: data?.contactId,
        companyId: data?.companyId,
        budget: data?.budget ?? 0,
        currency: data?.currency ?? 'RUB',
        pipelineId: data?.pipelineId ?? 'pl1',
        stageId: data?.stageId ?? firstStage,
        expectedCloseDate: data?.expectedCloseDate,
        status: 'open',
        tags: data?.tags ?? [],
        ownerId: data?.ownerId ?? '1',
        createdAt: now,
        updatedAt: now,
      }
      MOCK_DEALS.push(newDeal)
      return newDeal as T
    }

    // Мок для создания контакта: POST /workspaces/:id/contacts
    if (url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/contacts$`))) {
      const now = new Date().toISOString()
      const newContact: MockContact = buildMockContact({
        id: 'mock-contact-' + Date.now(),
        firstName: data?.firstName ?? '',
        lastName: data?.lastName ?? '',
        phones: data?.phones ?? [],
        emails: data?.emails ?? [],
        companyId: data?.companyId,
        position: data?.position,
        tags: data?.tags ?? [],
        ownerId: data?.ownerId ?? '1',
        createdBy: '1',
        updatedBy: '1',
        createdAt: now,
        updatedAt: now,
      })
      MOCK_CONTACTS.push(newContact)
      return newContact as T
    }

    // POST /workspaces/:id/activities — создание заметки или звонка
    if (url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/activities$`))) {
      const now = new Date().toISOString()
      const createdBy = { id: '1', name: 'Анна Менеджер' }
      const entityType = data?.entityType ?? 'contact'
      const entityId = data?.entityId ?? ''
      const key = mockActivityKey(entityType, entityId)
      if (!MOCK_ACTIVITIES_STORE[key]) MOCK_ACTIVITIES_STORE[key] = []
      const type = data?.type ?? 'note'
      const newActivity: MockActivity = {
        id: 'mock-activity-' + Date.now(),
        type,
        entityType,
        entityId,
        title: data?.title ?? (type === 'call' ? 'Звонок' : 'Заметка'),
        description: data?.description,
        metadata:
          type === 'call'
            ? {
                callDuration: data?.duration,
                callDirection: data?.direction,
                callStatus: data?.status,
              }
            : undefined,
        isImportant: data?.isImportant ?? false,
        createdBy,
        createdAt: now,
        isEditable: type === 'note',
        isDeletable: type === 'note',
      }
      MOCK_ACTIVITIES_STORE[key].unshift(newActivity)
      return newActivity as T
    }

    // POST /workspaces/:id/activities/:id/important — переключить важность
    const activityImportantMatch = url.match(
      new RegExp(`^${apiV1}/workspaces/[^/]+/activities/([^/]+)/important$`),
    )
    if (activityImportantMatch) {
      const id = activityImportantMatch[1]
      for (const key of Object.keys(MOCK_ACTIVITIES_STORE)) {
        const idx = MOCK_ACTIVITIES_STORE[key].findIndex((a) => a.id === id)
        if (idx !== -1) {
          MOCK_ACTIVITIES_STORE[key][idx].isImportant = !MOCK_ACTIVITIES_STORE[key][idx].isImportant
          return MOCK_ACTIVITIES_STORE[key][idx] as T
        }
      }
      throw { response: { status: 404, data: { message: 'Activity not found' } } }
    }

    // По умолчанию возвращаем объект
    return {} as T
  }

  async put<T>(url: string, data?: any): Promise<T> {
    await delay()
    const contactUpdateMatch = url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/contacts/([^/]+)$`))
    if (contactUpdateMatch) {
      const id = contactUpdateMatch[1]
      const idx = MOCK_CONTACTS.findIndex((c) => c.id === id)
      if (idx !== -1 && data) {
        const now = new Date().toISOString()
        MOCK_CONTACTS[idx] = { ...MOCK_CONTACTS[idx], ...data, updatedAt: now }
        return MOCK_CONTACTS[idx] as T
      }
    }
    const companyUpdateMatch = url.match(
      new RegExp(`^${apiV1}/workspaces/[^/]+/companies/([^/]+)$`),
    )
    if (companyUpdateMatch) {
      const id = companyUpdateMatch[1]
      const idx = MOCK_COMPANIES.findIndex((c) => c.id === id)
      if (idx !== -1 && data) {
        const now = new Date().toISOString()
        MOCK_COMPANIES[idx] = { ...MOCK_COMPANIES[idx], ...data, updatedAt: now }
        return MOCK_COMPANIES[idx] as T
      }
    }
    const dealUpdateMatch = url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/deals/([^/]+)$`))
    if (dealUpdateMatch && data) {
      const id = dealUpdateMatch[1]
      const idx = MOCK_DEALS.findIndex((d) => d.id === id)
      if (idx !== -1) {
        const now = new Date().toISOString()
        MOCK_DEALS[idx] = { ...MOCK_DEALS[idx], ...data, updatedAt: now }
        return MOCK_DEALS[idx] as T
      }
    }
    const activityUpdateMatch = url.match(
      new RegExp(`^${apiV1}/workspaces/[^/]+/activities/([^/]+)$`),
    )
    if (activityUpdateMatch && data) {
      const id = activityUpdateMatch[1]
      for (const key of Object.keys(MOCK_ACTIVITIES_STORE)) {
        const idx = MOCK_ACTIVITIES_STORE[key].findIndex((a) => a.id === id)
        if (idx !== -1) {
          MOCK_ACTIVITIES_STORE[key][idx] = {
            ...MOCK_ACTIVITIES_STORE[key][idx],
            ...data,
          }
          return MOCK_ACTIVITIES_STORE[key][idx] as T
        }
      }
      throw { response: { status: 404, data: { message: 'Activity not found' } } }
    }
    return (data as T) || ({} as T)
  }

  async delete<T>(url: string): Promise<T> {
    await delay()
    const contactDeleteMatch = url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/contacts/([^/]+)$`))
    if (contactDeleteMatch) {
      const id = contactDeleteMatch[1]
      const idx = MOCK_CONTACTS.findIndex((c) => c.id === id)
      if (idx !== -1) MOCK_CONTACTS.splice(idx, 1)
    }
    const companyDeleteMatch = url.match(
      new RegExp(`^${apiV1}/workspaces/[^/]+/companies/([^/]+)$`),
    )
    if (companyDeleteMatch) {
      const id = companyDeleteMatch[1]
      const idx = MOCK_COMPANIES.findIndex((c) => c.id === id)
      if (idx !== -1) MOCK_COMPANIES.splice(idx, 1)
    }
    const dealDeleteMatch = url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/deals/([^/]+)$`))
    if (dealDeleteMatch) {
      const id = dealDeleteMatch[1]
      const idx = MOCK_DEALS.findIndex((d) => d.id === id)
      if (idx !== -1) MOCK_DEALS.splice(idx, 1)
    }
    const activityDeleteMatch = url.match(
      new RegExp(`^${apiV1}/workspaces/[^/]+/activities/([^/]+)$`),
    )
    if (activityDeleteMatch) {
      const id = activityDeleteMatch[1]
      for (const key of Object.keys(MOCK_ACTIVITIES_STORE)) {
        const idx = MOCK_ACTIVITIES_STORE[key].findIndex((a) => a.id === id)
        if (idx !== -1) {
          MOCK_ACTIVITIES_STORE[key].splice(idx, 1)
          break
        }
      }
    }
    return {} as T
  }
}

export const mockApi = new MockApiClient()
