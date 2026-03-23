export type { ModalConfig, ModalInstance } from './modal'
export { modalManager, useModal } from './modal'
export { useTheme, initTheme } from './use-theme'
export { updateFavicon } from './use-favicon'
export { useDebounce, useDebounceFn } from './use-debounce'
export type { ThemeMode } from './use-theme'
export {
  getLocalDateString,
  formatLocalDate,
  formatDateRu,
  formatDateTimeRu,
  formatTimeRu,
  formatDateDisplay,
  formatRelativeTime,
  formatRelativeTimeI18n,
  formatDateWithAppLocale,
  getGreeting,
  getTextPreview,
} from './date'
export { PASSWORD_REGEX, PASSWORD_ERROR, validatePassword, getPasswordError } from './validation'
export { isRichContentEmpty } from './rich-content'
