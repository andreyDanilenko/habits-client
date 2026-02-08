export type DropdownPlacement = 'top' | 'bottom' | 'left' | 'right'
export type DropdownTrigger = 'click' | 'hover'

export interface DropdownProps {
  placement?: DropdownPlacement
  trigger?: DropdownTrigger
  width?: number | string
  offset?: number
  showOverlay?: boolean
  closeOnClickOutside?: boolean
  contentClass?: string
  triggerClass?: string
  useTeleport?: boolean
}
