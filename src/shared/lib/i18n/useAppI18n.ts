import { useI18n } from 'vue-i18n'
import { setLocale as setPersistedLocale, type SupportedLocale } from './instance'

/**
 * Единственная точка входа к vue-i18n в компонентах и композаблах.
 * При смене библиотеки меняется только этот файл.
 */
export function useAppI18n() {
  const composer = useI18n()
  // Возвращаем весь API composer (t, locale, te, d, n, …) и добавляем свои поля.
  return Object.assign(composer, {
    /** Синоним `t` */
    translate: composer.t,
    /** Смена языка UI + запись в localStorage */
    setLocale: (locale: SupportedLocale) => setPersistedLocale(locale),
  })
}
