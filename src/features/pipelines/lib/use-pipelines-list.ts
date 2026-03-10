import { ref, computed } from 'vue'
import { useWorkspaceStore } from '@/entities/workspace'
import { pipelineService, type Pipeline } from '@/entities/deal'
import { usePagination } from '@/shared/lib/use-pagination'

export function usePipelinesList() {
  const workspaceStore = useWorkspaceStore()

  const pipelines = ref<Pipeline[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedId = ref<string | null>(null)

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')

  const PAGE_SIZE = 10
  const pagination = usePagination(pipelines, PAGE_SIZE)

  const fetchPipelines = async () => {
    if (!workspaceId.value) return

    isLoading.value = true
    error.value = null

    try {
      pipelines.value = await pipelineService.getList(workspaceId.value)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Не удалось загрузить воронки'
    } finally {
      isLoading.value = false
    }
  }

  const selectPipeline = (id: string | null) => {
    selectedId.value = id
  }

  const getPipelineById = (id: string) => {
    return pipelines.value.find((p) => p.id === id) ?? null
  }

  const updateInList = (updatedPipeline: Pipeline) => {
    pipelines.value = pipelines.value.map((p) =>
      p.id === updatedPipeline.id ? updatedPipeline : p,
    )
  }

  const removeFromList = (id: string) => {
    pipelines.value = pipelines.value.filter((p) => p.id !== id)
  }

  const addToList = (pipeline: Pipeline) => {
    pipelines.value = [...pipelines.value, pipeline]
  }

  return {
    // Состояние
    pipelines,
    isLoading,
    error,
    selectedId,

    // Пагинация
    pagination,
    PAGE_SIZE,

    // Методы
    fetchPipelines,
    selectPipeline,
    getPipelineById,
    updateInList,
    removeFromList,
    addToList,
    workspaceId,
  }
}
