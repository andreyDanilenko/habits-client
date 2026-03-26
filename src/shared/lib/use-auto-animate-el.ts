import { autoAnimate } from '@formkit/auto-animate'
import type { VNodeRef } from 'vue'

type AutoAnimateOptions = NonNullable<Parameters<typeof autoAnimate>[1]>

export function useAutoAnimateRef(options?: Partial<AutoAnimateOptions>): VNodeRef {
  let initialized = false

  return (el) => {
    if (initialized) return

    const node: unknown =
      el && typeof el === 'object' && '$el' in (el as any) ? (el as any).$el : (el as any)

    if (!(node instanceof HTMLElement)) return

    autoAnimate(node, options)
    initialized = true
  }
}

