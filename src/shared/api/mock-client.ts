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

interface MockCompany {
  id: string
  name: string
  inn?: string
  phone?: string
  email?: string
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

interface MockDeal {
  id: string
  name: string
  contactId?: string
  companyId?: string
  budget: number
  currency: string
  pipelineId: string
  stageId: string
  expectedCloseDate?: string
  status: string
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
      { id: 'st1', name: 'Лиды', order: 1, probability: 10, isFinal: false, isLost: false },
      { id: 'st2', name: 'Переговоры', order: 2, probability: 50, isFinal: false, isLost: false },
      { id: 'st3', name: 'Согласование', order: 3, probability: 80, isFinal: false, isLost: false },
      { id: 'st4', name: 'Выигрыш', order: 4, probability: 100, isFinal: true, isLost: false },
      { id: 'st5', name: 'Проигрыш', order: 5, probability: 0, isFinal: false, isLost: true },
    ],
  },
]

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
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: 'open',
    probability: 50,
    tags: ['крупный'],
    ownerId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd2',
    name: 'Консультация',
    contactId: 'c3',
    budget: 50000,
    currency: 'RUB',
    pipelineId: 'pl1',
    stageId: 'st1',
    status: 'open',
    probability: 10,
    tags: [],
    ownerId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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

    // Мок для workspace
    if (url === apiV1 + '/workspaces') {
      return MOCK_WORKSPACES as T
    }

    // Мок для контактов CRM: GET /workspaces/:id/contacts
    const contactsMatch = url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/contacts(\\?|$)`))
    if (contactsMatch) {
      const parsed = new URL(url, 'http://_')
      const search = parsed.searchParams.get('search')?.toLowerCase() ?? ''
      const page = Math.max(1, parseInt(parsed.searchParams.get('page') ?? '1', 10))
      const limit = Math.min(100, Math.max(1, parseInt(parsed.searchParams.get('limit') ?? '20', 10)))
      const sortBy = parsed.searchParams.get('sortBy') ?? 'createdAt'
      const sortOrder = parsed.searchParams.get('sortOrder') ?? 'desc'
      let list = [...MOCK_CONTACTS]
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
      const limit = Math.min(100, Math.max(1, parseInt(parsed.searchParams.get('limit') ?? '20', 10)))
      const sortBy = parsed.searchParams.get('sortBy') ?? 'createdAt'
      const sortOrder = parsed.searchParams.get('sortOrder') ?? 'desc'
      let list = [...MOCK_COMPANIES]
      if (search) {
        list = list.filter(
          (c) =>
            c.name.toLowerCase().includes(search) ||
            (c.email?.toLowerCase().includes(search)) ||
            (c.inn?.includes(search)),
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
    const companyDetailMatch = url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/companies/([^/]+)$`))
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

    // GET /workspaces/:id/deals
    const dealsListMatch = url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/deals(\\?|$)`))
    if (dealsListMatch) {
      const parsed = new URL(url, 'http://_')
      const page = Math.max(1, parseInt(parsed.searchParams.get('page') ?? '1', 10))
      const limit = Math.min(100, Math.max(1, parseInt(parsed.searchParams.get('limit') ?? '20', 10)))
      const sortBy = parsed.searchParams.get('sortBy') ?? 'createdAt'
      const sortOrder = parsed.searchParams.get('sortOrder') ?? 'desc'
      let list = [...MOCK_DEALS]
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
        phone: data?.phone,
        email: data?.email,
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
    const companyUpdateMatch = url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/companies/([^/]+)$`))
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
    const companyDeleteMatch = url.match(new RegExp(`^${apiV1}/workspaces/[^/]+/companies/([^/]+)$`))
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
    return {} as T
  }
}

export const mockApi = new MockApiClient()
