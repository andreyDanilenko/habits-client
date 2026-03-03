export type { Deal, Pipeline, Stage, CreateDealDto, UpdateDealDto } from './types/deal'
export { dealService } from './api/deal-service'
export type { DealsListParams, DealsListResponse } from './api/deal-service'
export {
  pipelineService,
  type CreatePipelineDto,
  type UpdatePipelineDto,
  type CreatePipelineStageDto,
  type UpdatePipelineStageDto,
} from './api/pipeline-service'
