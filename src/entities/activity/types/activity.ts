export type ActivityType =
  | 'note'
  | 'call'
  | 'email'
  | 'task'
  | 'deal_stage_changed'
  | 'contact_created'
  | 'contact_updated'
  | 'company_created'
  | 'company_updated'
  | 'deal_created'
  | 'file_attached'
  | 'message'

export type ActivityEntityType = 'contact' | 'company' | 'deal'

export interface ActivityMetadata {
  callDuration?: number
  callDirection?: 'in' | 'out'
  callStatus?: 'answered' | 'missed' | 'no_answer'
  callRecording?: string
  emailSubject?: string
  emailFrom?: string
  emailTo?: string[]
  emailAttachments?: Array<{ name: string; size: number; url: string }>
  fromStage?: { id: string; name: string }
  toStage?: { id: string; name: string }
  dealValue?: number
  changedFields?: Array<{
    field: string
    fieldLabel: string
    oldValue: unknown
    newValue: unknown
  }>
  files?: Array<{ name: string; size: number; type: string; url: string }>
}

export interface Activity {
  id: string
  type: ActivityType
  entityType: ActivityEntityType
  entityId: string
  title: string
  description?: string
  metadata?: ActivityMetadata
  isImportant?: boolean
  createdBy: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  isEditable?: boolean
  isDeletable?: boolean
}

export interface ActivityFilters {
  types?: ActivityType[]
  dateFrom?: string
  dateTo?: string
  importantOnly?: boolean
  search?: string
}

export interface GetActivitiesParams {
  entityType: ActivityEntityType
  entityId: string
  page?: number
  limit?: number
  filters?: ActivityFilters
}

export interface ActivitiesResponse {
  data: Activity[]
  total: number
  page: number
  limit: number
}

export interface CreateNoteDto {
  entityType: ActivityEntityType
  entityId: string
  title: string
  description?: string
  isImportant?: boolean
  files?: File[]
  reminder?: {
    date: string
    assignTo?: string
  }
}

export interface CreateCallDto {
  entityType: ActivityEntityType
  entityId: string
  direction: 'in' | 'out'
  status: 'answered' | 'missed' | 'no_answer'
  duration?: number
  description?: string
  isImportant?: boolean
}

export interface UpdateNoteDto {
  title?: string
  description?: string
  isImportant?: boolean
}
