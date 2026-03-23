import { createI18n } from 'vue-i18n'
import ru from './locales/ru.json'
import en from './locales/en.json'

export type SupportedLocale = 'ru' | 'en'

export const SUPPORTED_LOCALES: SupportedLocale[] = ['ru', 'en']
export const DEFAULT_LOCALE: SupportedLocale = 'ru'

/** Отображаемые названия языков для настроек профиля */
export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  ru: 'Русский',
  en: 'English',
}

const STORAGE_KEY = 'app-locale'

function getStoredLocale(): SupportedLocale {
  const stored = localStorage.getItem(STORAGE_KEY)
  return (
    SUPPORTED_LOCALES.includes(stored as SupportedLocale) ? stored : DEFAULT_LOCALE
  ) as SupportedLocale
}

export const i18n = createI18n({
  legacy: false,
  locale: getStoredLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    ru,
    en,
  },
})

export function setLocale(locale: SupportedLocale) {
  i18n.global.locale.value = locale
  localStorage.setItem(STORAGE_KEY, locale)
}
