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
            <Button size="md" variant="outline" @click="openEdit">Редактировать</Button>
            <Button size="md" variant="ghost" @click="confirmDeleteContact">Удалить</Button>
            <Button size="md" variant="primary" @click="openAttachToDeal">Добавить в сделку</Button>
          </div>
        </div>
      </div>
    </template>

    <template #content>
      <div v-if="isLoading" class="flex justify-center py-12">
        <Spinner class="size-8 text-primary-default" />
      </div>
      <template v-else-if="contact">
        <DetailTabsPanel v-model="activeTab" :tabs="tabs">
          <template #main>
            <section class="space-y-(--spacing-6)">
              <div>
                <h3 class="text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)">
                  Контактные данные
                </h3>
                <dl class="space-y-(--spacing-2) text-(--text-sm)">
                  <div
                    v-for="(p, i) in contact.phones"
                    :key="`p-${i}`"
                    class="flex gap-(--spacing-2)"
                  >
                    <dt class="text-text-muted w-28">{{ phoneTypeLabel(p.type) }}:</dt>
                    <dd class="text-(--text-sm) text-text-primary">
                      <a
                        :href="`tel:${p.number}`"
                        class="text-primary-default hover:underline"
                      >
                        {{ p.number }}
                      </a>
                    </dd>
                  </div>
                  <div
                    v-for="(e, i) in contact.emails"
                    :key="`e-${i}`"
                    class="flex gap-(--spacing-2)"
                  >
                    <dt class="text-text-muted w-28">
                      {{ e.type === 'work' ? 'Рабочий' : 'Личный' }} email:
                    </dt>
                    <dd class="text-(--text-sm) text-text-primary">
                      <a
                        :href="`mailto:${e.address}`"
                        class="text-primary-default hover:underline"
                      >
                        {{ e.address }}
                      </a>
                    </dd>
                  </div>
                  <div v-if="contact.birthday" class="flex gap-(--spacing-2)">
                    <dt class="text-text-muted w-28">День рождения:</dt>
                    <dd class="text-(--text-sm) text-text-primary">
                      {{ formatContactDate(contact.birthday) }}
                    </dd>
                  </div>
                  <div class="flex gap-(--spacing-2)">
                    <dt class="text-text-muted w-28">Соцсети:</dt>
                    <dd class="text-(--text-sm) text-text-primary text-text-muted">
                      Telegram, WhatsApp, VK — (скоро)
                    </dd>
                  </div>
                  <template
                    v-if="!contact.phones?.length && !contact.emails?.length && !contact.birthday"
                  >
                    <dd class="text-(--text-sm) text-text-primary text-text-muted">—</dd>
                  </template>
                </dl>
              </div>
              <div>
                <h3 class="text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)">
                  Адрес
                </h3>
                <p class="text-(--text-sm) text-text-muted">
                  Страна, город, улица — (скоро)
                </p>
              </div>
              <div>
                <h3 class="text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)">
                  Дополнительная информация
                </h3>
                <div v-if="contact.tags?.length" class="flex flex-wrap gap-(--spacing-2)">
                  <span
                    v-for="tag in contact.tags"
                    :key="tag"
                    class="px-(--spacing-2) py-(--spacing-0-5) rounded bg-bg-tertiary text-text-secondary text-(--text-sm)"
                  >
                    {{ tag }}
                  </span>
                </div>
                <p v-else class="text-(--text-sm) text-text-muted">
                  Теги не указаны. Комментарий — (скоро).
                </p>
              </div>
            </section>
          </template>
          <template #deals>
            <div class="flex items-center justify-between gap-(--spacing-4) mb-(--spacing-4)">
              <h3 class="text-(--text-sm) font-medium text-text-secondary">
                Сделки по контакту
                <span
                  v-if="contactDeals.length"
                  class="ml-(--spacing-2) font-normal text-text-primary"
                >
                  — всего: {{ contactDeals.length }}
                </span>
              </h3>
              <Button size="md" variant="primary" @click="openAttachToDeal">
                Добавить в сделку
              </Button>
            </div>
            <div
              v-if="contactDealsLoading"
              class="text-text-muted text-(--text-sm) py-(--spacing-4)"
            >
              Загрузка…
            </div>
            <div
              v-else-if="!contactDeals.length"
              class="text-text-muted text-(--text-sm) py-(--spacing-4)"
            >
              Пока нет сделок, связанных с этим контактом.
            </div>
            <ul v-else class="space-y-(--spacing-2)">
              <li
                v-for="deal in contactDeals"
                :key="deal.id"
                class="flex items-center justify-between gap-(--spacing-4) py-(--spacing-2) border-b border-border-light"
              >
                <router-link
                  :to="{ name: 'CrmDealDetail', params: { id: deal.id } }"
                  class="text-primary-default hover:underline text-(--text-sm)"
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
            <ActivityFeed
              entity-type="contact"
              :entity-id="contactId"
              :can-create="canCreateCrm"
            />
          </template>
          <template #projects>
            <ProjectEntityPanel
              :workspace-id="workspaceId"
              entity-type="crm_contact"
              :entity-id="contactId"
              :entity-name="contact ? `${contact.firstName} ${contact.lastName}`.trim() : undefined"
              :can-edit="canCreateCrm"
              projects-base-path="/projects"
            />
          </template>
          <template #tasks>
            <p class="text-text-muted text-(--text-sm)">
              Список задач по контакту. Создать задачу (тема, срок, ответственный) — (скоро).
            </p>
          </template>
        </DetailTabsPanel>
      </template>
      <div v-else class="text-center py-12 text-text-muted">Контакт не найден.</div>
    </template>

    <template #modals>
      <ContactFormModal
        :is-open="showFormModal"
        :contact="contact ?? null"
        @close="
          showFormModal = false;
          fetchContact()
        "
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
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { Modal, ConfirmModal, Button, Spinner, DetailTabsPanel } from '@/shared/ui'
  import { ArrowLeftIcon } from '@/shared/ui/icon'
  import { BasePageLayout } from '@/shared/ui/common'
  import { ContactFormModal, useContactDetail } from '@/features/contacts'
  import { phoneTypeLabel, formatContactDate } from '@/features/contacts/lib/format'
  import { formatDealMoney } from '@/features/deals/lib/format'
  import { ActivityFeed } from '@/features/activity'
  import { ProjectEntityPanel } from '@/features/projects'
  import { usePermissions, WorkspacePermission } from '@/entities/workspace'
  import { DealsAttachContactModal } from '@/features/deals'
  import type { CreateContactDto } from '@/entities/contact'

  const router = useRouter()

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

  const tabs = [
    { id: 'main', label: 'Основная информация' },
    { id: 'deals', label: 'Сделки' },
    { id: 'activity', label: 'Активность' },
    { id: 'projects', label: 'Проекты' },
    { id: 'tasks', label: 'Задачи' },
  ]

  const { hasPermission } = usePermissions()
  const canCreateCrm = computed(() => hasPermission(WorkspacePermission.CRM_CREATE))
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
