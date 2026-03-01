<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-8">
    <router-link
      :to="{ name: 'CrmCompanies' }"
      class="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary-default mb-4"
    >
      <ArrowLeftIcon class="size-4" />
      К списку компаний
    </router-link>

    <div v-if="isLoading" class="flex justify-center py-12">
      <Spinner />
    </div>
    <template v-else-if="company">
      <header class="flex flex-wrap items-start gap-4 p-4 rounded-xl border border-border-default bg-bg-primary">
        <div class="min-w-0 flex-1">
          <h1 class="text-text-primary text-xl font-semibold">{{ company.name }}</h1>
          <p v-if="company.inn" class="text-text-secondary text-sm mt-0.5">ИНН {{ company.inn }}</p>
          <div class="flex flex-wrap gap-2 mt-3">
            <Button size="sm" variant="outline" @click="openEdit">Редактировать</Button>
            <Button size="sm" variant="ghost" @click="confirmDeleteCompany">Удалить</Button>
          </div>
        </div>
      </header>

      <div class="rounded-xl border border-border-default bg-bg-primary overflow-hidden">
        <nav class="flex border-b border-border-default">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.id
                ? 'border-primary-default text-primary-default'
                : 'border-transparent text-text-secondary hover:text-text-primary',
            ]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </nav>
        <div class="p-6">
          <!-- Вкладка 1: Основная информация -->
          <template v-if="activeTab === 'main'">
            <section class="space-y-6">
              <div>
                <h3 class="text-sm font-medium text-text-secondary mb-2">Реквизиты</h3>
                <dl class="grid gap-2 sm:grid-cols-2 text-sm">
                  <div class="flex gap-2">
                    <dt class="text-text-muted w-28">Название:</dt>
                    <dd class="text-text-primary">{{ company.name }}</dd>
                  </div>
                  <div v-if="company.inn" class="flex gap-2">
                    <dt class="text-text-muted w-28">ИНН:</dt>
                    <dd>{{ company.inn }}</dd>
                  </div>
                  <div v-if="company.kpp" class="flex gap-2">
                    <dt class="text-text-muted w-28">КПП:</dt>
                    <dd>{{ company.kpp }}</dd>
                  </div>
                  <div v-if="company.ogrn" class="flex gap-2">
                    <dt class="text-text-muted w-28">ОГРН:</dt>
                    <dd>{{ company.ogrn }}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 class="text-sm font-medium text-text-secondary mb-2">Контакты</h3>
                <dl class="space-y-2 text-sm">
                  <div v-if="company.phone" class="flex gap-2">
                    <dt class="text-text-muted w-24">Телефон:</dt>
                    <dd><a :href="`tel:${company.phone}`" class="text-primary-default hover:underline">{{ company.phone }}</a></dd>
                  </div>
                  <div v-if="company.email" class="flex gap-2">
                    <dt class="text-text-muted w-24">Email:</dt>
                    <dd><a :href="`mailto:${company.email}`" class="text-primary-default hover:underline">{{ company.email }}</a></dd>
                  </div>
                  <div v-if="company.website" class="flex gap-2">
                    <dt class="text-text-muted w-24">Сайт:</dt>
                    <dd><a :href="company.website" target="_blank" rel="noopener" class="text-primary-default hover:underline">{{ company.website }}</a></dd>
                  </div>
                  <template v-if="!company.phone && !company.email && !company.website">
                    <dd class="text-text-muted">—</dd>
                  </template>
                </dl>
              </div>
              <div v-if="company.legalAddress || company.actualAddress">
                <h3 class="text-sm font-medium text-text-secondary mb-2">Адреса</h3>
                <dl class="space-y-2 text-sm">
                  <div v-if="company.legalAddress" class="flex gap-2">
                    <dt class="text-text-muted w-28">Юридический:</dt>
                    <dd>{{ formatAddress(company.legalAddress) }}</dd>
                  </div>
                  <div v-if="company.actualAddress" class="flex gap-2">
                    <dt class="text-text-muted w-28">Фактический:</dt>
                    <dd>{{ formatAddress(company.actualAddress) }}</dd>
                  </div>
                </dl>
              </div>
              <div v-if="company.tags?.length">
                <h3 class="text-sm font-medium text-text-secondary mb-2">Теги</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in company.tags"
                    :key="tag"
                    class="px-2 py-0.5 rounded bg-bg-tertiary text-text-secondary text-sm"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              <div>
                <h3 class="text-sm font-medium text-text-secondary mb-1">Ответственный</h3>
                <p class="text-sm text-text-muted">{{ company.ownerId ? 'ID ' + company.ownerId : '—' }}</p>
              </div>
            </section>
          </template>

          <!-- Вкладка 2: Контакты -->
          <template v-else-if="activeTab === 'contacts'">
            <div class="flex items-center justify-between gap-4 mb-4">
              <h3 class="text-sm font-medium text-text-secondary">Сотрудники компании</h3>
              <div class="flex gap-2">
                <Button size="sm" variant="ghost" @click="openAttachContact">Привязать контакт</Button>
                <Button size="sm" variant="outline" @click="openCreateContact">Создать контакт</Button>
              </div>
            </div>
            <div v-if="companyContacts.length === 0" class="text-text-muted text-sm py-4">
              Нет привязанных контактов.
            </div>
            <div v-else class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-border-default text-left text-text-muted">
                    <th class="py-2 pr-4">Имя</th>
                    <th class="py-2 pr-4">Должность</th>
                    <th class="py-2 pr-4">Email / Телефон</th>
                    <th class="py-2 w-20" />
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="c in companyContacts"
                    :key="c.id"
                    class="border-b border-border-light"
                  >
                    <td class="py-2 pr-4">
                      <router-link
                        :to="{ name: 'CrmContactDetail', params: { id: c.id } }"
                        class="text-primary-default hover:underline"
                      >
                        {{ contactDisplayName(c) }}
                      </router-link>
                    </td>
                    <td class="py-2 pr-4">{{ c.position ?? '—' }}</td>
                    <td class="py-2 pr-4">{{ c.emails?.[0]?.address ?? c.phones?.[0]?.number ?? '—' }}</td>
                    <td class="py-2" />
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="mt-2 text-xs text-text-muted">Привязать/создать контакт — в разработке.</p>
          </template>

          <!-- Вкладка 3: Сделки -->
          <template v-else-if="activeTab === 'deals'">
            <div class="flex items-center justify-between gap-4 mb-4">
              <h3 class="text-sm font-medium text-text-secondary">
                Сделки компании
                <span v-if="companyDeals.length" class="ml-2 font-normal text-text-primary">
                  — общая сумма: {{ formatSum(companyDealsSum) }}
                </span>
              </h3>
            </div>
            <div v-if="companyDealsLoading" class="text-text-muted text-sm py-4">Загрузка…</div>
            <div v-else-if="companyDeals.length === 0" class="text-text-muted text-sm py-4">
              Нет сделок по этой компании.
            </div>
            <ul v-else class="space-y-2">
              <li
                v-for="deal in companyDeals"
                :key="deal.id"
                class="flex items-center justify-between gap-4 py-2 border-b border-border-light"
              >
                <router-link
                  :to="{ name: 'CrmDealDetail', params: { id: deal.id } }"
                  class="text-primary-default hover:underline"
                >
                  {{ deal.name }}
                </router-link>
                <span class="text-sm font-medium text-primary-default">{{ formatMoney(deal.budget, deal.currency) }}</span>
              </li>
            </ul>
          </template>

          <!-- Вкладка 4: Активность -->
          <template v-else-if="activeTab === 'activity'">
            <ActivityFeed
              entity-type="company"
              :entity-id="companyId"
            />
          </template>
        </div>
      </div>
    </template>
    <div v-else class="text-center py-12 text-text-muted">Компания не найдена.</div>

    <CompanyFormModal
      :is-open="showFormModal"
      :company="company ?? null"
      @close="showFormModal = false; fetchCompany()"
      @update="handleUpdate"
    />
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
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Modal, ConfirmModal, Button, Spinner } from '@/shared/ui'
  import { ArrowLeftIcon } from '@/shared/ui/icon'
  import { CompanyFormModal } from '@/features/companies'
  import { ActivityFeed } from '@/features/activity'
  import { companyService } from '@/entities/company'
  import { contactService } from '@/entities/contact'
  import { dealService } from '@/entities/deal'
  import { useWorkspaceStore } from '@/entities/workspace'
  import type { Company, CreateCompanyDto, CompanyAddress } from '@/entities/company'
  import type { Contact } from '@/entities/contact'
  import type { Deal } from '@/entities/deal'

  const route = useRoute()
  const router = useRouter()
  const workspaceStore = useWorkspaceStore()

  const company = ref<Company | null>(null)
  const companyContacts = ref<Contact[]>([])
  const companyDeals = ref<Deal[]>([])
  const companyDealsLoading = ref(false)
  const isLoading = ref(true)
  const showFormModal = ref(false)
  const showDeleteModal = ref(false)
  const activeTab = ref('main')

  const tabs = [
    { id: 'main', label: 'Основная информация' },
    { id: 'contacts', label: 'Контакты' },
    { id: 'deals', label: 'Сделки' },
    { id: 'activity', label: 'Активность' },
  ]

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')
  const companyId = computed(() => route.params.id as string)

  const companyDealsSum = computed(() =>
    companyDeals.value.reduce((acc: number, d: Deal) => acc + (d.budget ?? 0), 0),
  )

  async function fetchCompany() {
    if (!workspaceId.value || !companyId.value) {
      company.value = null
      return
    }
    isLoading.value = true
    try {
      company.value = await companyService.getById(workspaceId.value, companyId.value)
    } catch {
      company.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCompanyContacts() {
    const c = company.value
    if (!workspaceId.value || !c?.contacts?.length) {
      companyContacts.value = []
      return
    }
    try {
      const list = await Promise.all(
        c.contacts.map((id) => contactService.getById(workspaceId.value, id)),
      )
      companyContacts.value = list
    } catch {
      companyContacts.value = []
    }
  }

  async function fetchCompanyDeals() {
    if (!workspaceId.value || !companyId.value) {
      companyDeals.value = []
      return
    }
    companyDealsLoading.value = true
    try {
      const res = await dealService.getList({
        workspaceId: workspaceId.value,
        companyId: companyId.value,
        limit: 100,
      })
      companyDeals.value = res.deals
    } catch {
      companyDeals.value = []
    } finally {
      companyDealsLoading.value = false
    }
  }

  watch([workspaceId, companyId], fetchCompany, { immediate: true })
  watch(company, (c: Company | null) => {
    if (c) {
      fetchCompanyContacts()
      fetchCompanyDeals()
    } else {
      companyContacts.value = []
      companyDeals.value = []
    }
  })

  function contactDisplayName(contact: Contact): string {
    const n = [contact.firstName, contact.lastName].filter(Boolean).join(' ')
    return n || contact.emails?.[0]?.address || contact.id
  }

  function formatAddress(addr: CompanyAddress): string {
    const parts = [addr.country, addr.city, addr.street, addr.building, addr.apartment].filter(Boolean)
    return parts.join(', ') || '—'
  }

  function formatSum(sum: number): string {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(sum) + ' ₽'
  }

  function formatMoney(value: number, currency: string): string {
    return (
      new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value) +
      (currency === 'RUB' ? ' ₽' : ` ${currency}`)
    )
  }

  function openEdit() {
    showFormModal.value = true
  }

  function openAttachContact() {
    // TODO: модалка выбора контакта для привязки
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
