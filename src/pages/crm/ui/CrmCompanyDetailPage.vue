<template>
  <BasePageLayout
    :title="company ? company.name : 'Компания'"
  >
    <template #header-title>
      <router-link
        :to="{ name: 'CrmCompanies' }"
        class="inline-flex items-center gap-(--spacing-1) text-(--text-sm) text-text-secondary hover:text-primary-default mb-(--spacing-2)"
      >
        <ArrowLeftIcon class="size-4" />
        К списку компаний
      </router-link>
      <div v-if="company" class="flex flex-wrap items-start gap-(--spacing-4)">
        <div
          class="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-default/10 text-primary-default text-(--text-xl) font-semibold"
        >
          {{ initials }}
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="text-text-primary text-(--text-xl) font-semibold">
            {{ company.name }}
          </h1>
          <p
            v-if="company.inn"
            class="text-text-secondary text-(--text-sm) mt-(--spacing-0-5)"
          >
            ИНН {{ company.inn }}
          </p>
          <div class="flex flex-wrap gap-(--spacing-2) mt-(--spacing-3)">
            <Button size="md" variant="outline" @click="openEdit">Редактировать</Button>
            <Button size="md" variant="ghost" @click="confirmDeleteCompany">Удалить</Button>
          </div>
        </div>
      </div>
    </template>

    <template #content>
      <div v-if="isLoading" class="flex justify-center py-12">
        <Spinner class="size-8 text-primary-default" />
      </div>
      <template v-else-if="company">
        <DetailTabsPanel v-model="activeTab" :tabs="tabs">
          <template #main>
            <section class="space-y-(--spacing-6)">
              <CompanyRequisites
                :name="company.name"
                :inn="company.inn"
                :kpp="company.kpp"
                :ogrn="company.ogrn"
              />
              <CompanyContactInfo
                :phone="company.phone"
                :email="company.email"
                :website="company.website"
              />
              <CompanyAddresses
                :legal-address="company.legalAddress"
                :actual-address="company.actualAddress"
              />
              <CompanyTags :tags="company.tags" />
              <CompanyResponsible :owner-id="company.ownerId" />
            </section>
          </template>
          <template #contacts>
            <ContactsTableSection
              title="Сотрудники компании"
              :contacts="companyContacts"
              empty-text="Нет привязанных контактов."
            >
              <template #actions>
                <Button size="md" variant="ghost" @click="openAttachContact">
                  Привязать контакт
                </Button>
                <Button size="md" variant="outline" @click="openCreateContact">
                  Создать контакт
                </Button>
              </template>
            </ContactsTableSection>
          </template>
          <template #deals>
            <div class="flex items-center justify-between gap-(--spacing-4) mb-(--spacing-4)">
              <h3 class="text-(--text-sm) font-medium text-text-secondary">
                Сделки компании
                <span
                  v-if="companyDeals && companyDeals.length"
                  class="ml-(--spacing-2) font-normal text-text-primary"
                >
                  — общая сумма: {{ formatDealMoney(companyDealsSum, 'RUB') }}
                </span>
              </h3>
            </div>
            <div
              v-if="companyDealsLoading"
              class="text-text-muted text-(--text-sm) py-(--spacing-4)"
            >
              Загрузка…
            </div>
            <div
              v-else-if="companyDeals && companyDeals.length === 0"
              class="text-text-muted text-(--text-sm) py-(--spacing-4)"
            >
              Нет сделок по этой компании.
            </div>
            <ul v-else class="space-y-(--spacing-2)">
              <li
                v-for="deal in companyDeals"
                :key="deal.id"
                class="flex items-center justify-between gap-(--spacing-4) py-(--spacing-2) border-b border-border-light"
              >
                <router-link
                  :to="{ name: 'CrmDealDetail', params: { id: deal.id } }"
                  class="text-primary-default hover:underline"
                >
                  {{ deal.name }}
                </router-link>
                <span class="text-(--text-sm) font-medium text-primary-default">
                  {{ formatDealMoney(deal.budget, deal.currency) }}
                </span>
              </li>
            </ul>
          </template>
          <template #activity>
            <ActivityFeed entity-type="company" :entity-id="companyId" />
          </template>
          <template #projects>
            <ProjectEntityPanel
              :workspace-id="workspaceId"
              entity-type="crm_company"
              :entity-id="companyId"
              :entity-name="company?.name"
              :can-edit="canEditCrm"
              projects-base-path="/projects"
            />
          </template>
        </DetailTabsPanel>
      </template>
      <div v-else class="text-center py-12 text-text-muted">Компания не найдена.</div>
    </template>

    <template #modals>
      <CompanyFormModal
        :is-open="showFormModal"
        :company="company ?? null"
        @close="
          showFormModal = false;
          fetchCompany()
        "
        @update="handleUpdate"
      />
      <Modal :is-open="showAttachContactModal" @close="closeAttachContactModal">
        <CompanyAttachContactForm
          :workspace-id="workspaceId"
          :is-open="showAttachContactModal"
          @close="closeAttachContactModal"
          @confirm="confirmAttachContact"
        />
      </Modal>
      <Modal :is-open="showDeleteModal" @close="showDeleteModal = false">
        <ConfirmModal
          title="Удалить компанию?"
          message="Компания будет удалена без возможности восстановления."
          confirm-text="Удалить"
          confirm-variant="danger"
          @close="showDeleteModal = false"
          @confirm="doDelete"
        />
      </Modal>
    </template>
  </BasePageLayout>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { Modal, ConfirmModal, Button, Spinner, DetailTabsPanel } from '@/shared/ui'
  import { ArrowLeftIcon } from '@/shared/ui/icon'
  import { BasePageLayout } from '@/shared/ui/common'
  import {
    CompanyFormModal,
    CompanyAttachContactForm,
    CompanyRequisites,
    CompanyContactInfo,
    CompanyAddresses,
    CompanyTags,
    CompanyResponsible,
    useCompanyDetail,
  } from '@/features/companies'
  import { ContactsTableSection } from '@/features/contacts'
  import { formatDealMoney } from '@/features/deals/lib/format'
  import { ActivityFeed } from '@/features/activity'
  import { ProjectEntityPanel } from '@/features/projects'
  import { companyService } from '@/entities/company'
  import { usePermissions, WorkspacePermission } from '@/entities/workspace'
  import type { CreateCompanyDto } from '@/entities/company'
  import type { Deal } from '@/entities/deal'

  const router = useRouter()

  const {
    workspaceId,
    companyId,
    company,
    companyContacts,
    companyDeals,
    companyDealsLoading,
    isLoading,
    fetchCompany,
    fetchCompanyContacts,
  } = useCompanyDetail()

  const activeTab = ref('main')
  const showFormModal = ref(false)
  const showDeleteModal = ref(false)
  const showAttachContactModal = ref(false)

  const tabs = [
    { id: 'main', label: 'Основная информация' },
    { id: 'contacts', label: 'Контакты' },
    { id: 'deals', label: 'Сделки' },
    { id: 'activity', label: 'Активность' },
    { id: 'projects', label: 'Проекты' },
  ]

  const { hasPermission } = usePermissions()
  const canEditCrm = computed(() => hasPermission(WorkspacePermission.CRM_CREATE))

  const companyDealsSum = computed(() =>
    companyDeals.value.reduce((acc: number, d: Deal) => acc + (d.budget ?? 0), 0),
  )

  const initials = computed(() => {
    if (!company.value?.name) return '?'
    return company.value.name.slice(0, 2).toUpperCase()
  })

  function openEdit() {
    showFormModal.value = true
  }

  function openAttachContact() {
    showAttachContactModal.value = true
  }

  function closeAttachContactModal() {
    showAttachContactModal.value = false
  }

  async function confirmAttachContact(contactId: string) {
    if (!workspaceId.value || !companyId.value) return
    await companyService.attachContact(workspaceId.value, companyId.value, contactId)
    showAttachContactModal.value = false
    await fetchCompany()
    await fetchCompanyContacts()
  }

  function openCreateContact() {
    router.push({ path: '/crm/contacts', query: { create: '1', companyId: companyId.value } })
  }

  function confirmDeleteCompany() {
    showDeleteModal.value = true
  }

  async function doDelete() {
    if (!company.value || !workspaceId.value) return
    await companyService.delete(workspaceId.value, company.value.id)
    showDeleteModal.value = false
    router.push({ name: 'CrmCompanies' })
  }

  async function handleUpdate(id: string, data: CreateCompanyDto) {
    if (!workspaceId.value) return
    await companyService.update(workspaceId.value, id, data)
    showFormModal.value = false
    await fetchCompany()
  }
</script>
