export interface ContactPhone {
  type: 'mobile' | 'work' | 'home'
  number: string
  isPrimary: boolean
}

export interface ContactEmail {
  type: 'work' | 'personal'
  address: string
  isPrimary: boolean
}

export interface Contact {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  phones: ContactPhone[]
  emails: ContactEmail[]
  companyId?: string
  position?: string
  birthday?: string
  tags: string[]
  ownerId: string
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  customFields?: Record<string, unknown>
}

export interface CreateContactDto {
  firstName: string
  lastName?: string
  middleName?: string
  phones?: ContactPhone[]
  emails?: ContactEmail[]
  companyId?: string
  position?: string
  birthday?: string
  tags?: string[]
  ownerId?: string
}

export type UpdateContactDto = Partial<CreateContactDto>
