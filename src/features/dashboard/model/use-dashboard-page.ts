import { computed, onMounted } from 'vue'
import { formatDateRu, getGreeting } from '@/shared/lib'
import { useUserStore } from '@/entities/user'
import { useHabitStore } from '@/entities/habit'
import { useWorkspaceStore } from '@/entities/workspace'

export const useDashboardPage = () => {
  const userStore = useUserStore()
  const habitStore = useHabitStore()
  const workspaceStore = useWorkspaceStore()

  const userName = computed(() => {
    return userStore.currentUser?.name || userStore.currentUser?.email?.split('@')[0] || 'Друг'
  })

  const greeting = computed(() => getGreeting())

  const formattedDate = computed(() => {
    return formatDateRu(new Date(), 'd MMMM, EEEE')
  })

  onMounted(() => {
    if (workspaceStore.currentWorkspace) {
      habitStore.fetchHabits(new Date())
    }
  })

  return {
    userName,
    greeting,
    formattedDate,
  }
}
