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
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <UserInfo
            :name="member.name"
            :email="member.email"
            size="md"
          />
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:flex-shrink-0">
            <div class="flex flex-col sm:items-end gap-1 min-w-0 sm:min-w-[140px]">
              <span
                v-if="isOwner(member)"
                class="text-sm text-text-secondary"
              >
                Владелец
              </span>
              <Select
                v-else
                :model-value="getRoleSelectValue(member)"
                :options="roleSelectOptions"
                :disabled="roleChangingMemberId === member.id"
                size="md"
                placeholder="Роль"
                @update:model-value="(v) => onRoleChangeValue(member, v)"
              />
            </div>
            <Button
              v-if="canRemoveMember(member)"
              variant="outline"
              size="md"
              :loading="removingMemberId === member.id"
              class="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto"
              @click="openRemoveModal(member)"
            >
              Удалить из workspace
            </Button>
          </div>
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
  import { ref, computed, onMounted, watch } from 'vue'
  import { Card, Button, Modal, ConfirmModal, Select, UserInfo } from '@/shared/ui'
  import {
    useWorkspaceStore,
    workspaceService,
    usePermissions,
    WorkspacePermission,
    type Member,
  } from '@/entities/workspace'
  import { useUserStore } from '@/entities/user'
  import { roleService } from '@/entities/role'
  import type { Role } from '@/entities/role'

  const SYSTEM_ROLES = ['OWNER', 'ADMIN', 'MEMBER', 'GUEST'] as const

  const workspaceStore = useWorkspaceStore()
  const userStore = useUserStore()
  const { hasPermission } = usePermissions()

  const members = ref<Member[]>([])
  const availableRoles = ref<Role[]>([])
  const isLoading = ref(false)
  const isError = ref(false)
  const removingMemberId = ref<string | null>(null)
  const showRemoveModal = ref(false)
  const memberToRemove = ref<Member | null>(null)
  const roleChangingMemberId = ref<string | null>(null)

  const customRoles = computed(() => availableRoles.value.filter((r) => !r.isSystem))

  const roleSelectOptions = computed(() => {
    const system = SYSTEM_ROLES.map((r) => ({ value: r, label: r }))
    const custom = customRoles.value.map((r) => ({ value: r.id, label: r.name }))
    return [...system, ...custom]
  })

  const canManageMembers = computed(
    () =>
      hasPermission(WorkspacePermission.MEMBERS_EDIT_ROLE) ||
      hasPermission(WorkspacePermission.MEMBERS_REMOVE),
  )

  const ownerCount = computed(
    () => members.value.filter((m) => String(m.systemRole).toUpperCase() === 'OWNER').length,
  )

  const currentUserId = computed(() => userStore.currentUser?.id ?? '')

  const isOwner = (member: Member) =>
    String(member.systemRole).toUpperCase() === 'OWNER'

  const canChangeRole = (member: Member) => {
    if (!canManageMembers.value) return false
    if (member.id === currentUserId.value) return false
    if (String(member.systemRole).toUpperCase() === 'OWNER' && ownerCount.value <= 1) return false
    return true
  }

  const canRemoveMember = (member: Member) => {
    if (!hasPermission(WorkspacePermission.MEMBERS_REMOVE)) return false
    if (member.id === currentUserId.value) return false
    if (String(member.systemRole).toUpperCase() === 'OWNER' && ownerCount.value <= 1) return false
    return true
  }

  const getRoleSelectValue = (member: Member): string => {
    const sr = member.systemRole
    if (SYSTEM_ROLES.includes(sr as (typeof SYSTEM_ROLES)[number])) return sr
    const r = availableRoles.value.find((x) => x.name === sr)
    return r?.id ?? sr
  }

  const loadRoles = async () => {
    const workspaceId = workspaceStore.currentWorkspace?.id
    if (!workspaceId) {
      availableRoles.value = []
      return
    }
    try {
      availableRoles.value = await roleService.list(workspaceId)
    } catch {
      availableRoles.value = []
    }
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

  const onRoleChangeValue = async (member: Member, value: string | number | null | undefined) => {
    const val = String(value ?? '')
    const workspaceId = workspaceStore.currentWorkspace?.id
    if (!workspaceId || !val) return
    if (val === getRoleSelectValue(member)) return

    roleChangingMemberId.value = member.id
    try {
      const payload = SYSTEM_ROLES.includes(val as (typeof SYSTEM_ROLES)[number])
        ? { role: val as (typeof SYSTEM_ROLES)[number] }
        : { roleId: val }
      await workspaceService.updateMemberRole(workspaceId, member.id, payload)
      member.systemRole = SYSTEM_ROLES.includes(val as (typeof SYSTEM_ROLES)[number])
        ? (val as Member['systemRole'])
        : (availableRoles.value.find((r) => r.id === val)?.name ?? val)
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
    void loadRoles()
    void loadMembers()
  })

  watch(
    () => workspaceStore.currentWorkspace?.id,
    () => {
      void loadRoles()
      void loadMembers()
    },
  )
</script>
