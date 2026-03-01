export interface Stage {
  id: string
  name: string
  order: number
  color?: string
  probability: number
  isFinal: boolean
  isLost: boolean
}

export interface Pipeline {
  id: string
  name: string
  stages: Stage[]
  isDefault: boolean
}

/** Сущность сделки — совпадает с API и отображением в списке/канбане */
export interface Deal {
  id: string
  name: string

  // Связи
  contactId?: string
  companyId?: string

  // Финансы
  budget: number
  currency: 'RUB' | 'USD' | 'EUR'

  // Воронка
  pipelineId: string
  stageId: string

  // Даты
  expectedCloseDate?: string
  actualCloseDate?: string

  // Статусы
  status: 'open' | 'won' | 'lost'
  lostReason?: string

  // Дополнительно
  description?: string
  source?: string
  probability?: number

  // Метаданные
  tags: string[]
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface CreateDealDto {
  name: string
  contactId?: string
  companyId?: string
  budget?: number
  currency?: 'RUB' | 'USD' | 'EUR'
  pipelineId: string
  stageId: string
  expectedCloseDate?: string
  description?: string
  ownerId?: string
}

export type UpdateDealDto = Partial<CreateDealDto> & { stageId?: string; status?: 'open' | 'won' | 'lost' }
