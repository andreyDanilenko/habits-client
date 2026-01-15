export interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface UserWorkspace {
  workspaceId: string
  // пока пример
  role: 'owner' | 'admin' | 'member' | 'guest'
  joinedAt: string
}
