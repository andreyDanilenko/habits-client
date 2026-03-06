import { computed, watch } from 'vue'
import { useLocalStorage } from '@/shared/lib/storage/storage'
import { updateFavicon } from '@/shared/lib/use-favicon'

const STORAGE_KEY = 'habitflow-theme'
export type ThemeMode = 'light' | 'dark'

export type ThemePalette = 'default' | 'lemon' | 'sky' | 'pink' | 'forest'

const PALETTE_CLASSES: Record<Exclude<ThemePalette, 'default'>, string> = {
  lemon: 'theme-lemon',
  sky: 'theme-sky',
  pink: 'theme-pink',
  forest: 'theme-forest',
}

function applyTheme(mode: ThemeMode, palette: ThemePalette) {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  root.classList.toggle('dark', mode === 'dark')

  Object.values(PALETTE_CLASSES).forEach((cls) => root.classList.remove(cls))
  if (palette !== 'default') {
    root.classList.add(PALETTE_CLASSES[palette])
  }

  requestAnimationFrame(() => updateFavicon())
}

type StoredTheme = { mode: ThemeMode; palette: ThemePalette }

function parseStored(value: string | null): StoredTheme {
  if (!value) return { mode: 'light', palette: 'default' }
  if (value === 'light' || value === 'dark') {
    return { mode: value, palette: 'default' }
  }
  try {
    const parsed = JSON.parse(value) as Partial<StoredTheme>
    const mode = parsed.mode === 'dark' ? 'dark' : 'light'
    const palette: ThemePalette =
      parsed.palette && ['default', 'lemon', 'sky', 'pink', 'forest'].includes(parsed.palette)
        ? (parsed.palette as ThemePalette)
        : 'default'
    return { mode, palette }
  } catch {
    return { mode: 'light', palette: 'default' }
  }
}

function getInitialStored(): string {
  if (typeof localStorage === 'undefined') return 'light'
  return localStorage.getItem(STORAGE_KEY) ?? 'light'
}

export function useTheme() {
  const { data: stored } = useLocalStorage<string>({
    key: STORAGE_KEY,
    initialValue: getInitialStored(),
    serializer: (value: string) => value,
    deserializer: (v) => v ?? 'light',
  })

  const mode = computed(() => parseStored(stored.value).mode)
  const palette = computed(() => parseStored(stored.value).palette)

  function setMode(newMode: ThemeMode) {
    const current = parseStored(stored.value)
    stored.value = JSON.stringify({ ...current, mode: newMode })
  }

  function setPalette(newPalette: ThemePalette) {
    const current = parseStored(stored.value)
    stored.value = JSON.stringify({ ...current, palette: newPalette })
  }

  watch(
    () => parseStored(stored.value),
    (theme) => {
      applyTheme(theme.mode, theme.palette)
    },
    { immediate: true, deep: true },
  )

  return { mode, palette, setTheme: setMode, setPalette }
}

export function initTheme() {
  if (typeof localStorage === 'undefined') return
  const raw = localStorage.getItem(STORAGE_KEY)
  const { mode, palette } = parseStored(raw)
  applyTheme(mode, palette)
}
