import { api, API_ENDPOINTS } from '@/shared/api'
import type { Pipeline, Stage } from '../types/deal'

export interface CreatePipelineStageDto {
  name: string
  order: number
  color?: string
  probability: number
  isFinal: boolean
  isLost: boolean
}

export interface UpdatePipelineStageDto extends CreatePipelineStageDto {
  id?: string
}

export interface CreatePipelineDto {
  name: string
  isDefault?: boolean
  stages: CreatePipelineStageDto[]
}

export interface UpdatePipelineDto {
  name?: string
  isDefault?: boolean
  stages?: UpdatePipelineStageDto[]
}

function normalizeStagesOrder(stages: Stage[]): Stage[] {
  return [...stages]
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((stage, index) => ({
      ...stage,
      order: index + 1,
    }))
}

export const pipelineService = {
  async getList(workspaceId: string): Promise<Pipeline[]> {
    // Поддерживаем разные формы ответа бэкенда и моков:
    // - { pipelines: Pipeline[] }
    // - Pipeline[]
    const res = await api.get<any>(API_ENDPOINTS.CRM.PIPELINES(workspaceId))

    const pipelines: Pipeline[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.pipelines)
        ? res.pipelines
        : []

    return pipelines.map((pipeline) => ({
      ...pipeline,
      stages: normalizeStagesOrder(pipeline.stages ?? []),
    }))
  },

  async create(workspaceId: string, data: CreatePipelineDto): Promise<Pipeline> {
    const payload: CreatePipelineDto = {
      ...data,
      stages: data.stages.map((stage, index) => ({
        ...stage,
        order: index + 1,
      })),
    }

    const created = await api.post<Pipeline>(API_ENDPOINTS.CRM.PIPELINES(workspaceId), payload)
    return {
      ...created,
      stages: normalizeStagesOrder(created.stages ?? []),
    }
  },

  async update(workspaceId: string, id: string, data: UpdatePipelineDto): Promise<Pipeline> {
    const stages = data.stages?.map((stage, index) => ({
      ...stage,
      order: index + 1,
    }))

    const updated = await api.put<Pipeline>(`${API_ENDPOINTS.CRM.PIPELINES(workspaceId)}/${id}`, {
      ...data,
      stages,
    })

    return {
      ...updated,
      stages: normalizeStagesOrder(updated.stages ?? []),
    }
  },

  async delete(workspaceId: string, id: string): Promise<void> {
    await api.delete<void>(`${API_ENDPOINTS.CRM.PIPELINES(workspaceId)}/${id}`)
  },
}
