<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <div>
      <h1 class="text-text-primary">Участники</h1>
      <p class="mt-2 text-text-secondary">
        Управляйте участниками workspace, их ролями и индивидуальными правами.
      </p>
    </div>

    <div v-if="isLoading" class="text-sm text-text-secondary">Загрузка списка участников…</div>

    <div v-else-if="isError" class="text-sm text-red-600">Не удалось загрузить участников.</div>

    <div v-else class="space-y-4">
      <Card v-for="member in members" :key="member.id" class="p-4">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <div class="font-medium text-text-primary">
              {{ member.name || member.email }}
            </div>
            <div class="text-xs text-text-secondary">
              {{ member.email }}
            </div>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            <div class="flex flex-col items-end gap-1">
              <label class="text-xs text-text-secondary">Системная роль</label>
              <select
                :value="member.systemRole"
                :disabled="!canChangeRole(member) || roleChangingMemberId === member.id"
                class="border border-border-default rounded-md px-2 py-1.5 text-sm bg-bg-primary text-text-primary disabled:opacity-60 disabled:cursor-not-allowed"
                @change="onRoleChange(member, $event)"
              >
                <option value="OWNER">OWNER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="MEMBER">MEMBER</option>
                <option value="GUEST">GUEST</option>
              </select>
            </div>
            <Button
              v-if="canRemoveMember(member)"
              variant="outline"
              size="md"
              :loading="removingMemberId === member.id"
              class="text-red-600 border-red-200 hover:bg-red-50"
              @click="openRemoveModal(member)"
            >
              Удалить из workspace
            </Button>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <MemberRoleChips :user-id="member.id" />
          <UserPermissionsPanel :user-id="member.id" />
        </div>
      </Card>
      <p v-if="!members.length" class="text-sm text-text-secondary">
        В этом workspace пока нет участников.
      </p>
    </div>

    <Modal :is-open="showRemoveModal" @update:is-open="showRemoveModal = $event">
      <ConfirmModal
        title="Удалить участника?"
        :message="
          memberToRemove
            ? `${memberToRemove.name || memberToRemove.email} (${memberToRemove.email}) будет удалён из workspace и потеряет доступ ко всем данным.`
            : ''
        "
        confirm-text="Удалить"
        confirm-variant="danger"
        :loading="removingMemberId !== null"
        @close="closeRemoveModal"
        @confirm="confirmRemove"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { Card, Button, Modal, ConfirmModal } from '@/shared/ui'
  import {
    useWorkspaceStore,
    workspaceService,
    usePermissions,
    WorkspacePermission,
    type Member,
  } from '@/entities/workspace'
  import { useUserStore } from '@/entities/user'
  import { MemberRoleChips } from '@/features/members'
  import { UserPermissionsPanel } from '@/features/user-permissions'

  const workspaceStore = useWorkspaceStore()
  const userStore = useUserStore()
  const { hasPermission } = usePermissions()

  const members = ref<Member[]>([])
  const isLoading = ref(false)
  const isError = ref(false)
  const removingMemberId = ref<string | null>(null)
  const showRemoveModal = ref(false)
  const memberToRemove = ref<Member | null>(null)
  const roleChangingMemberId = ref<string | null>(null)

  const canManageMembers = computed(
    () =>
      hasPermission(WorkspacePermission.MEMBERS_EDIT_ROLE) ||
      hasPermission(WorkspacePermission.MEMBERS_REMOVE),
  )

  const ownerCount = computed(
    () => members.value.filter((m) => m.systemRole === 'OWNER').length,
  )

  const currentUserId = computed(() => userStore.currentUser?.id ?? '')

  const canChangeRole = (member: Member) => {
    if (!canManageMembers.value) return false
    if (member.id === currentUserId.value) return false
    if (member.systemRole === 'OWNER' && ownerCount.value <= 1) return false
    return true
  }

  const canRemoveMember = (member: Member) => {
    if (!hasPermission(WorkspacePermission.MEMBERS_REMOVE)) return false
    if (member.id === currentUserId.value) return false
    if (member.systemRole === 'OWNER' && ownerCount.value <= 1) return false
    return true
  }

  const loadMembers = async () => {
    const workspaceId = workspaceStore.currentWorkspace?.id
    if (!workspaceId) {
      members.value = []
      return
    }
    isLoading.value = true
    isError.value = false
    try {
      members.value = await workspaceService.getWorkspaceMembers(workspaceId)
    } catch {
      isError.value = true
      members.value = []
    } finally {
      isLoading.value = false
    }
  }

  const onRoleChange = async (member: Member, ev: Event) => {
    const newRole = (ev.target && 'value' in ev.target ? (ev.target as HTMLSelectElement).value : '') as string
    const workspaceId = workspaceStore.currentWorkspace?.id
    if (!workspaceId || !['OWNER', 'ADMIN', 'MEMBER', 'GUEST'].includes(newRole)) return
    if (newRole === member.systemRole) return

    roleChangingMemberId.value = member.id
    try {
      await workspaceService.updateMemberRole(
        workspaceId,
        member.id,
        newRole as 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST',
      )
      member.systemRole = newRole as Member['systemRole']
    } catch (err) {
      console.error('Failed to update role:', err)
      await loadMembers()
    } finally {
      roleChangingMemberId.value = null
    }
  }

  const openRemoveModal = (member: Member) => {
    memberToRemove.value = member
    showRemoveModal.value = true
  }

  const closeRemoveModal = () => {
    if (!removingMemberId.value) {
      memberToRemove.value = null
      showRemoveModal.value = false
    }
  }

  const confirmRemove = async () => {
    const member = memberToRemove.value
    const workspaceId = workspaceStore.currentWorkspace?.id
    if (!member || !workspaceId) return

    removingMemberId.value = member.id
    try {
      await workspaceService.removeMember(workspaceId, member.id)
      members.value = members.value.filter((m) => m.id !== member.id)
      memberToRemove.value = null
      showRemoveModal.value = false
    } catch (err) {
      console.error('Failed to remove member:', err)
    } finally {
      removingMemberId.value = null
    }
  }

  onMounted(() => {
    void loadMembers()
  })
</script>
