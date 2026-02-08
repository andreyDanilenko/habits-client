import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import type { DropdownPlacement, DropdownTrigger } from './types'

export interface UseDropdownOptions {
  placement?: DropdownPlacement
  trigger?: DropdownTrigger
  width?: number | string
  offset?: number
  closeOnClickOutside?: boolean
  useTeleport?: boolean
  onOpen?: () => void
  onClose?: () => void
}

export function useDropdown(options: UseDropdownOptions = {}) {
  const {
    placement = 'bottom',
    trigger: _trigger = 'click',
    width,
    offset = 8,
    closeOnClickOutside = true,
    useTeleport = false,
    onOpen,
    onClose,
  } = options

  const isOpen = ref(false)
  const triggerRef = ref<HTMLElement | null>(null)
  const dropdownRef = ref<HTMLElement | null>(null)
  const containerRef = ref<HTMLElement | null>(null)

  const dropdownStyle = computed(() => {
    if (!useTeleport || !triggerRef.value || !dropdownRef.value) return {}
    const rect = triggerRef.value.getBoundingClientRect()
    const widthStyle = width != null ? (typeof width === 'number' ? `${width}px` : width) : 'auto'
    const style: Record<string, string> = { width: widthStyle }
    switch (placement) {
      case 'bottom':
        style.top = `${rect.bottom + offset}px`
        style.left = `${rect.left}px`
        break
      case 'top':
        style.bottom = `${window.innerHeight - rect.top + offset}px`
        style.left = `${rect.left}px`
        break
      case 'left':
        style.top = `${rect.top}px`
        style.right = `${window.innerWidth - rect.left + offset}px`
        break
      case 'right':
        style.top = `${rect.top}px`
        style.left = `${rect.left + rect.width + offset}px`
        break
      default:
        style.top = `${rect.bottom + offset}px`
        style.left = `${rect.left}px`
    }
    return style
  })

  const open = () => {
    if (!isOpen.value) {
      isOpen.value = true
      onOpen?.()
    }
  }

  const close = () => {
    if (isOpen.value) {
      isOpen.value = false
      onClose?.()
    }
  }

  const toggle = () => {
    isOpen.value ? close() : open()
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (!closeOnClickOutside || !containerRef.value) return
    const target = e.target as Node
    if (!containerRef.value.contains(target) && !dropdownRef.value?.contains(target)) {
      close()
    }
  }

  watch(isOpen, (open) => {
    if (open) {
      nextTick(() => document.addEventListener('click', handleClickOutside))
    } else {
      document.removeEventListener('click', handleClickOutside)
    }
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  return {
    isOpen,
    triggerRef,
    dropdownRef,
    containerRef,
    dropdownStyle,
    open,
    close,
    toggle,
  }
}
