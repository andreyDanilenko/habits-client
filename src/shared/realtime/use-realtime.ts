import { ref, watch } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '@/features/auth'
import { useWorkspaceStore } from '@/entities/workspace'

// Same-origin: в dev через Vite proxy, в prod через nginx proxy
const REALTIME_URL = import.meta.env.VITE_REALTIME_URL || ''

export type RealtimeEventType =
  | 'habit.created'
  | 'habit.updated'
  | 'habit.deleted'
  | 'habit.completed'
  | 'deal.created'
  | 'deal.updated'
  | 'deal.deleted'
  | 'invitation.accepted'

export type RealtimeEventHandler = (payload: unknown) => void

const handlers = new Map<RealtimeEventType, Set<RealtimeEventHandler>>()
let socketInstance: Socket | null = null
const isConnected = ref(false)

function emitToHandlers(eventType: RealtimeEventType, payload: unknown) {
  handlers.get(eventType)?.forEach((fn) => fn(payload))
}

export function useRealtime() {
  const authStore = useAuthStore()
  const workspaceStore = useWorkspaceStore()

  function connect() {
    if (socketInstance?.connected) return

    const base = REALTIME_URL || (typeof window !== 'undefined' ? window.location.origin : '')
    const url = `${base}/notifications`
    socketInstance = io(url, {
      path: '/socket.io',
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    socketInstance.on('connect', () => {
      isConnected.value = true
      const wsId = workspaceStore.currentWorkspace?.id
      if (wsId) {
        socketInstance?.emit('joinWorkspace', wsId)
        console.log('[realtime] Connected, joined workspace:', wsId)
      } else {
        console.log('[realtime] Connected, no workspace yet')
      }
    })

    socketInstance.on('disconnect', () => {
      isConnected.value = false
    })

    socketInstance.on('connect_error', (err) => {
      console.warn('[realtime] Connect error:', err.message)
    })

    const eventTypes: RealtimeEventType[] = [
      'habit.created',
      'habit.updated',
      'habit.deleted',
      'habit.completed',
      'deal.created',
      'deal.updated',
      'deal.deleted',
      'invitation.accepted',
    ]
    eventTypes.forEach((eventType) => {
      socketInstance?.on(eventType, (payload: unknown) => {
        console.log('[realtime] Event:', eventType)
        emitToHandlers(eventType, payload)
      })
    })
  }

  function disconnect() {
    socketInstance?.disconnect()
    socketInstance = null
    isConnected.value = false
  }

  function on(eventType: RealtimeEventType, handler: RealtimeEventHandler) {
    if (!handlers.has(eventType)) {
      handlers.set(eventType, new Set())
    }
    handlers.get(eventType)!.add(handler)
    return () => handlers.get(eventType)?.delete(handler)
  }

  watch(
    () => authStore.isAuthenticated,
    (authenticated) => {
      if (authenticated) {
        connect()
      } else {
        disconnect()
      }
    },
    { immediate: true },
  )

  watch(
    () => workspaceStore.currentWorkspace?.id,
    (wsId) => {
      if (socketInstance?.connected && wsId) {
        socketInstance.emit('joinWorkspace', wsId)
      }
    },
  )

  return { socket: ref(socketInstance), isConnected, on }
}
