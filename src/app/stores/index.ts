import { createPinia } from 'pinia'
import { useUserStore } from '@/entities/user'
import { useWorkspaceStore } from '@/entities/workspace'

export const pinia = createPinia()
export { useUserStore, useWorkspaceStore }
