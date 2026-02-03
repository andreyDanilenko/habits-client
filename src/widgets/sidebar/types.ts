import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

export interface SidebarNavItem {
  id: string
  label: string
  icon: Component | { template: string }
  to?: RouteLocationRaw
  onClick?: () => void
  variant?: 'default' | 'danger'
  isActive?: boolean
}

export interface SidebarNavSection {
  id: string
  title?: string
  items: SidebarNavItem[]
}
