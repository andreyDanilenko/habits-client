import { ref, watch, type Ref } from 'vue'

/**
 * Простой композабл для debounce значений
 * @param value - Реактивное значение
 * @param delay - Задержка в мс
 * @returns Debounced значение
 */
export function useDebounce<T>(value: Ref<T>, delay: number = 300) {
  const debouncedValue = ref(value.value) as Ref<T>
  let timeout: ReturnType<typeof setTimeout> | null = null

  watch(value, (newValue) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      debouncedValue.value = newValue
      timeout = null
    }, delay)
  })

  return debouncedValue
}

/**
 * Хук для debounce функции
 * @param fn - Функция
 * @param delay - Задержка в мс
 * @returns Debounced функция
 */
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      fn(...args)
      timeout = null
    }, delay)
  }

  onUnmounted(() => {
    if (timeout) {
      clearTimeout(timeout)
    }
  })

  return debouncedFn
}
