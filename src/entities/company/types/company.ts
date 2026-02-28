export interface CompanyAddress {
  country: string
  city: string
  street: string
  building: string
  apartment?: string
}

export interface Company {
  id: string
  name: string
  inn?: string
  kpp?: string
  ogrn?: string
  phone?: string
  email?: string
  website?: string
  legalAddress?: CompanyAddress
  actualAddress?: CompanyAddress
  contacts: string[]
  tags: string[]
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface CreateCompanyDto {
  name: string
  inn?: string
  kpp?: string
  ogrn?: string
  phone?: string
  email?: string
  website?: string
  tags?: string[]
  ownerId?: string
}

export type UpdateCompanyDto = Partial<CreateCompanyDto>
