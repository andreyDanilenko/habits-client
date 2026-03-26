import type { ChatProvider, ListRecipientsParams } from '@/chat/providers/chat-provider'
import type { ChatRecipient, ChatWidgetContext } from '@/chat/types'
import { workspaceService } from '@/entities/workspace'

function includesNormalized(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.trim().toLowerCase())
}

export const erpChatProvider: ChatProvider = {
  async listRecipients(ctx: ChatWidgetContext, params?: ListRecipientsParams): Promise<ChatRecipient[]> {
    const workspaceId = ctx.currentWorkspace.id
    const members = await workspaceService.getWorkspaceMembers(workspaceId)

    const selfId = ctx.currentUser.id
    const search = (params?.search ?? '').trim()
    const limit = params?.limit ?? 50

    const filtered = members
      .filter((m) => m.id !== selfId)
      .filter((m) => {
        if (!search) return true
        return includesNormalized(m.name ?? '', search) || includesNormalized(m.email ?? '', search)
      })
      .slice(0, Math.max(1, limit))

    return filtered.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      avatarUrl: m.avatarUrl,
      role: m.systemRole,
    }))
  },
}

