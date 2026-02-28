<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-8">
    <router-link
      to="/crm/companies"
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
      <section class="rounded-xl border border-border-default bg-bg-primary p-6">
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
        <div v-if="company.tags?.length" class="mt-4">
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
      </section>
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
  import { companyService } from '@/entities/company'
  import { useWorkspaceStore } from '@/entities/workspace'
  import type { Company, CreateCompanyDto } from '@/entities/company'

  const route = useRoute()
  const router = useRouter()
  const workspaceStore = useWorkspaceStore()

  const company = ref<Company | null>(null)
  const isLoading = ref(true)
  const showFormModal = ref(false)
  const showDeleteModal = ref(false)

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')
  const companyId = computed(() => route.params.id as string)

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

  watch([workspaceId, companyId], fetchCompany, { immediate: true })

  function openEdit() {
    showFormModal.value = true
  }

  function confirmDeleteCompany() {
    showDeleteModal.value = true
  }

  async function doDelete() {
    if (!company.value || !workspaceId.value) return
    await companyService.delete(workspaceId.value, company.value.id)
    showDeleteModal.value = false
    router.push('/crm/companies')
  }

  async function handleUpdate(id: string, data: CreateCompanyDto) {
    if (!workspaceId.value) return
    await companyService.update(workspaceId.value, id, data)
    showFormModal.value = false
    await fetchCompany()
  }
</script>
