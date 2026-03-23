import { computed, onMounted } from 'vue'
import { useAppI18n } from '@/shared/lib/i18n'
import { formatDateWithAppLocale } from '@/shared/lib'
import { useUserStore } from '@/entities/user'
import { useHabitStore } from '@/entities/habit'
import { useWorkspaceStore } from '@/entities/workspace'

export const useDashboardPage = () => {
  const { t } = useAppI18n()
  const userStore = useUserStore()
  const habitStore = useHabitStore()
  const workspaceStore = useWorkspaceStore()

  const userName = computed(() => {
    const u = userStore.currentUser
    const base = u?.name || u?.email?.split('@')[0]
    return base || t('dashboard.header.friendFallback')
  })

  const greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour >= 4 && hour < 12) return t('dashboard.greeting.morning')
    if (hour >= 12 && hour < 18) return t('dashboard.greeting.afternoon')
    if (hour >= 18 && hour < 22) return t('dashboard.greeting.evening')
    return t('dashboard.greeting.night')
  })

  const formattedDate = computed(() => formatDateWithAppLocale(new Date(), 'd MMMM, EEEE'))

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
