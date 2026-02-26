import { watch } from 'vue'
import { useLocalStorage } from '@/shared/lib/storage/storage'

const STORAGE_KEY = 'habitflow-theme'
export type ThemeMode = 'light' | 'dark'

function applyTheme(isDark: boolean) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function useTheme() {
  const { data: mode } = useLocalStorage<ThemeMode>({
    key: STORAGE_KEY,
    initialValue: 'light',
    serializer: (value) => value,
    deserializer: (value) => {
      if (value === 'light' || value === 'dark') return value
      return 'light'
    }
  })

  function setTheme(newMode: ThemeMode) {
    mode.value = newMode
  }

  watch(mode, (newMode) => {
    applyTheme(newMode === 'dark')
  }, { immediate: true })

  return { mode, setTheme }
}

export function initTheme() {
  if (typeof localStorage === 'undefined') return
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    applyTheme(stored === 'dark')
  } else {
    applyTheme(false)
  }
}
