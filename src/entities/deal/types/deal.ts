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

export interface Deal {
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

export type UpdateDealDto = Partial<CreateDealDto> & { stageId?: string }
