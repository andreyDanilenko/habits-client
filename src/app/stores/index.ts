import { createPinia } from 'pinia'
import { useUserStore } from '@/entities/user/model/user-store'
import { useWorkspaceStore } from '@/entities/workspace/model/workspace-store'

export const pinia = createPinia()

// Экспорт для удобства
export { useUserStore, useWorkspaceStore }
