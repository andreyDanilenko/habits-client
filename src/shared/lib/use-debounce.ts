import { onUnmounted, ref, watch, type Ref } from 'vue'

/**
 * Debounce реактивного значения.
 * @param value - Реактивное значение
 * @param delay - Задержка в мс
 * @returns Ref с отложенным значением
 */
export function useDebounce<T>(value: Ref<T>, delay: number = 300): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>
  let timeout: ReturnType<typeof setTimeout> | null = null

  watch(value, (newValue) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
      timeout = null
    }, delay)
  })

  onUnmounted(() => {
    if (timeout) clearTimeout(timeout)
  })

  return debouncedValue
}

/**
 * Debounce функции (для поиска, submit и т.п.).
 * @param fn - Функция
 * @param delay - Задержка в мс
 * @returns Debounced функция
 */
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn(...args)
      timeout = null
    }, delay)
  }

  onUnmounted(() => {
    if (timeout) clearTimeout(timeout)
  })

  return debouncedFn
}
