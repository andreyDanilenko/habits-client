/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue-router' {
  export function useRoute(): import('vue-router').RouteLocationNormalizedLoaded
  export function useRouter(): import('vue-router').Router
  export function createRouter(
    options: import('vue-router').RouterOptions,
  ): import('vue-router').Router
  export function createWebHistory(base?: string): import('vue-router').RouterHistory

  export type RouteRecordRaw = import('vue-router').RouteRecordRaw
  export type RouteLocationRaw = import('vue-router').RouteLocationRaw
  export type RouteLocationNormalized = import('vue-router').RouteLocationNormalized
  export type RouteLocationNormalizedLoaded = import('vue-router').RouteLocationNormalizedLoaded
  export type NavigationGuardNext = import('vue-router').NavigationGuardNext
  export type Router = import('vue-router').Router
  export type RouterHistory = import('vue-router').RouterHistory

  interface RouteMeta {
    module?: string
  }
}
