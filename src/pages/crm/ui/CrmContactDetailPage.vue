<template>
  <BasePageLayout
    :title="contact ? `${contact.firstName} ${contact.lastName}`.trim() || 'Контакт' : 'Контакт'"
  >
    <template #header-title>
      <router-link
        to="/crm/contacts"
        class="inline-flex items-center gap-(--spacing-1) text-(--text-sm) text-text-secondary hover:text-primary-default mb-(--spacing-2)"
      >
        <ArrowLeftIcon class="size-4" />
        К списку контактов
      </router-link>
      <div v-if="contact" class="flex flex-wrap items-start gap-(--spacing-4)">
        <div
          class="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-default/10 text-primary-default text-(--text-xl) font-semibold"
        >
          {{ initials }}
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="text-text-primary text-(--text-xl) font-semibold">
            {{ contact.firstName }} {{ contact.lastName }}
          </h1>
          <p
            v-if="contact.position || companyName"
            class="text-text-secondary text-(--text-sm) mt-(--spacing-0-5)"
          >
            {{ [contact.position, companyName].filter(Boolean).join(' · ') }}
          </p>
          <div class="flex flex-wrap items-center gap-(--spacing-2) mt-(--spacing-2)">
            <span
              :class="[
                'text-(--text-xs) px-(--spacing-2) py-(--spacing-0-5) rounded',
                contactActive
                  ? 'bg-success-light text-success-default'
                  : 'bg-bg-tertiary text-text-muted',
              ]"
            >
              {{ contactActive ? 'Активный' : 'Неактивный' }}
            </span>
          </div>
          <div class="flex flex-wrap gap-(--spacing-2) mt-(--spacing-3)">
            <PermissionGuard :permission="CRM_PERMISSIONS.contactUpdate">
              <Button size="md" variant="outline" @click="openEdit">Редактировать</Button>
            </PermissionGuard>
            <PermissionGuard :permission="CRM_PERMISSIONS.contactDelete">
              <Button size="md" variant="ghost" @click="confirmDeleteContact">Удалить</Button>
            </PermissionGuard>
            <PermissionGuard :permission="CRM_PERMISSIONS.dealCreate">
              <Button size="md" variant="primary" @click="openAttachToDeal"
                >Добавить в сделку</Button
              >
            </PermissionGuard>
          </div>
        </div>
      </div>
    </template>

    <template #content>
      <div v-if="isLoading" class="flex justify-center py-12">
        <Spinner class="size-8 text-primary-default" />
      </div>
      <template v-else-if="contact">
        <DetailTabsPanel
          v-model="activeTab"
          :tabs="tabs"
          :tab-components="tabComponents"
          :tab-props="tabProps"
        />
      </template>
      <div v-else class="text-center py-12 text-text-muted">Контакт не найден.</div>
    </template>

    <template #modals>
      <ContactFormModal
        :is-open="showFormModal"
        :contact="contact ?? null"
        @close="handleFormClose"
        @save="handleSave"
        @update="handleUpdate"
      />
      <Modal :is-open="showDeleteModal" @close="showDeleteModal = false">
        <ConfirmModal
          title="Удалить контакт?"
          message="Контакт будет удалён без возможности восстановления."
          confirm-text="Удалить"
          confirm-variant="danger"
          @close="showDeleteModal = false"
          @confirm="doDelete"
        />
      </Modal>
      <DealsAttachContactModal
        :is-open="showAttachToDealModal"
        :workspace-id="workspaceId"
        :contact="contact"
        @close="showAttachToDealModal = false"
        @attached="fetchContactDeals"
      />
    </template>
  </BasePageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { Modal, ConfirmModal, Button, Spinner, DetailTabsPanel } from '@/shared/ui'
  import { PermissionGuard } from '@/features/permissions'
  import { ArrowLeftIcon } from '@/shared/ui/icon'
  import { BasePageLayout } from '@/shared/ui/common'
  import {
    ContactFormModal,
    ContactMainInfo,
    ContactDealsSection,
    ContactTasksPlaceholder,
    useContactDetail,
  } from '@/features/contacts'
  import { ActivityFeed } from '@/features/activity'
  import { ProjectEntityPanel } from '@/features/projects'
  import { usePermissions } from '@/features/permissions'
  import { CRM_PERMISSIONS, PROJECT_PERMISSIONS } from '@/features/permissions/config'
  import { DealsAttachContactModal } from '@/features/deals'
  import type { CreateContactDto } from '@/entities/contact'

  const router = useRouter()
  const { can } = usePermissions()

  const {
    workspaceId,
    contactId,
    contact,
    isLoading,
    contactDeals,
    contactDealsLoading,
    fetchContact,
    fetchContactDeals,
    createContact,
    updateContact,
    deleteContact,
  } = useContactDetail()

  const activeTab = ref('main')
  const showFormModal = ref(false)
  const showDeleteModal = ref(false)
  const contactActive = ref(true)
  const showAttachToDealModal = ref(false)

  const allTabs = [
    { id: 'main', label: 'Основная информация' },
    { id: 'deals', label: 'Сделки' },
    { id: 'activity', label: 'Активность' },
    { id: 'projects', label: 'Проекты' },
    { id: 'tasks', label: 'Задачи' },
  ]
  const tabs = computed(() =>
    allTabs.filter((t) => {
      if (t.id === 'activity') return can(CRM_PERMISSIONS.activityRead)
      if (t.id === 'projects') return can(PROJECT_PERMISSIONS.projectRead)
      return true
    }),
  )

  watch(
    tabs,
    (next) => {
      const ids = next.map((t) => t.id)
      if (!ids.includes(activeTab.value)) {
        activeTab.value = ids[0] ?? 'main'
      }
    },
    { immediate: true },
  )

  const tabComponents = {
    main: ContactMainInfo,
    deals: ContactDealsSection,
    activity: ActivityFeed,
    projects: ProjectEntityPanel,
    tasks: ContactTasksPlaceholder,
  }

  const canActivityCreate = computed(() => can(CRM_PERMISSIONS.activityCreate))
  const canActivityEdit = computed(() => can(CRM_PERMISSIONS.activityUpdate))
  const canActivityDelete = computed(() => can(CRM_PERMISSIONS.activityDelete))

  const tabProps = computed(() => ({
    main: { contact: contact.value! },
    deals: {
      deals: contactDeals.value,
      loading: contactDealsLoading.value,
      onAttachToDeal: openAttachToDeal,
    },
    activity: {
      entityType: 'contact' as const,
      entityId: contactId.value,
      canCreate: canActivityCreate.value,
      canEdit: canActivityEdit.value,
      canDelete: canActivityDelete.value,
    },
    projects: {
      workspaceId: workspaceId.value,
      entityType: 'crm_contact',
      entityId: contactId.value,
      entityName: contact.value
        ? `${contact.value.firstName} ${contact.value.lastName}`.trim()
        : undefined,
      canEdit: can(PROJECT_PERMISSIONS.entityAttach),
      projectsBasePath: '/projects',
    },
    tasks: {
      text: 'Список задач по контакту. Создать задачу (тема, срок, ответственный) — (скоро).',
    },
  }))

  const initials = computed(() => {
    if (!contact.value) return '?'
    const f = contact.value.firstName?.slice(0, 1) ?? ''
    const l = contact.value.lastName?.slice(0, 1) ?? ''
    return (f + l).toUpperCase() || '?'
  })
  const companyName = computed(() => (contact.value?.companyId ? 'Компания' : ''))

  function openEdit() {
    showFormModal.value = true
  }

  function handleFormClose() {
    showFormModal.value = false
    fetchContact()
  }

  function confirmDeleteContact() {
    showDeleteModal.value = true
  }

  function openAttachToDeal() {
    if (!contact.value) return
    showAttachToDealModal.value = true
  }

  async function doDelete() {
    if (!contact.value || !workspaceId.value) return
    await deleteContact(contact.value.id)
    showDeleteModal.value = false
    router.push('/crm/contacts')
  }

  async function handleSave(data: CreateContactDto) {
    await createContact(data)
    showFormModal.value = false
  }

  async function handleUpdate(id: string, data: CreateContactDto) {
    await updateContact(id, data)
    showFormModal.value = false
  }
</script>
