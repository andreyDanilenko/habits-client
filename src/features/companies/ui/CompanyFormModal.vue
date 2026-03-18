<template>
  <ModalContent
    :title="company ? 'Редактировать компанию' : 'Новая компания'"
    :show-close-button="true"
    :fullscreen-on-mobile="isMobile"
    @close="$emit('close')"
  >
    <form id="company-form" class="space-y-6 lg:space-y-6" @submit.prevent="handleSubmit">
      <section class="space-y-4">
        <h3 class="text-sm font-medium text-text-secondary">Реквизиты</h3>
        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
            >Название <span class="text-error-default">*</span></span
          >
          <Input v-model="form.name" placeholder="Название компании" required />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
              >ИНН</span
            >
            <Input v-model="form.inn" placeholder="ИНН" />
          </div>
          <div>
            <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
              >КПП</span
            >
            <Input v-model="form.kpp" placeholder="КПП" />
          </div>
          <div>
            <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
              >ОГРН</span
            >
            <Input v-model="form.ogrn" placeholder="ОГРН" />
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-sm font-medium text-text-secondary">Контакты</h3>
        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
            >Телефон</span
          >
          <Input v-model="form.phone" type="tel" placeholder="+7 (495) 000-00-00" />
        </div>
        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
            >Email</span
          >
          <Input v-model="form.email" type="email" placeholder="email@company.ru" />
        </div>
        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
            >Сайт</span
          >
          <Input v-model="form.website" type="url" placeholder="https://" />
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-sm font-medium text-text-secondary">Юридический адрес</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
              >Страна</span
            >
            <Input v-model="form.legalCountry" placeholder="Россия" />
          </div>
          <div>
            <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
              >Город</span
            >
            <Input v-model="form.legalCity" placeholder="Москва" />
          </div>
        </div>
        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
            >Улица</span
          >
          <Input v-model="form.legalStreet" placeholder="ул. Примерная" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
              >Дом</span
            >
            <Input v-model="form.legalBuilding" placeholder="1" />
          </div>
          <div>
            <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
              >Офис / квартира</span
            >
            <Input v-model="form.legalApartment" placeholder="—" />
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-sm font-medium text-text-secondary">Фактический адрес</h3>
        <div class="flex items-center gap-2">
          <Checkbox v-model="sameAsLegal" />
          <span class="text-sm text-text-secondary">Совпадает с юридическим</span>
        </div>
        <template v-if="!sameAsLegal">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
                >Страна</span
              >
              <Input v-model="form.actualCountry" placeholder="Россия" />
            </div>
            <div>
              <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
                >Город</span
              >
              <Input v-model="form.actualCity" placeholder="Москва" />
            </div>
          </div>
          <div>
            <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
              >Улица</span
            >
            <Input v-model="form.actualStreet" placeholder="ул. Примерная" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
                >Дом</span
              >
              <Input v-model="form.actualBuilding" placeholder="1" />
            </div>
            <div>
              <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
                >Офис / квартира</span
              >
              <Input v-model="form.actualApartment" placeholder="—" />
            </div>
          </div>
        </template>
      </section>

      <section class="space-y-4">
        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
            >Теги (через запятую)</span
          >
          <Input v-model="form.tagsStr" placeholder="важный, партнёр" />
        </div>
      </section>
    </form>

    <template #footer>
      <div class="flex justify-end gap-(--spacing-2)">
        <Button type="button" variant="ghost" @click="$emit('close')">Отмена</Button>
        <Button form="company-form" type="submit" :loading="saving">Сохранить</Button>
      </div>
    </template>
  </ModalContent>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onUnmounted } from 'vue'
  import { ModalContent, Button, Input, Checkbox } from '@/shared/ui'
  import type { Company, CreateCompanyDto, CompanyAddress } from '@/entities/company'

  const props = defineProps<{
    isOpen: boolean
    company: Company | null
  }>()

  const isMobile = ref(false)
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024
  }
  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

  const emit = defineEmits<{
    close: []
    confirm: [payload: { id?: string; data: CreateCompanyDto }]
    save: [data: CreateCompanyDto]
    update: [id: string, data: CreateCompanyDto]
  }>()

  const saving = ref(false)
  const sameAsLegal = ref(false)

  const form = ref({
    name: '',
    inn: '',
    kpp: '',
    ogrn: '',
    phone: '',
    email: '',
    website: '',
    legalCountry: '',
    legalCity: '',
    legalStreet: '',
    legalBuilding: '',
    legalApartment: '',
    actualCountry: '',
    actualCity: '',
    actualStreet: '',
    actualBuilding: '',
    actualApartment: '',
    tagsStr: '',
  })

  function addressToForm(addr: CompanyAddress | undefined) {
    if (!addr) return { country: '', city: '', street: '', building: '', apartment: '' }
    return {
      country: addr.country ?? '',
      city: addr.city ?? '',
      street: addr.street ?? '',
      building: addr.building ?? '',
      apartment: addr.apartment ?? '',
    }
  }

  function formToAddress(
    country: string,
    city: string,
    street: string,
    building: string,
    apartment: string,
  ): CompanyAddress | undefined {
    const filled = [country, city, street, building].some((s) => s?.trim())
    if (!filled) return undefined
    return {
      country: country.trim() || '',
      city: city.trim() || '',
      street: street.trim() || '',
      building: building.trim() || '',
      apartment: apartment.trim() || undefined,
    }
  }

  watch(
    () => [props.isOpen, props.company] as const,
    ([open, company]) => {
      if (open) {
        const leg = addressToForm(company?.legalAddress)
        const act = addressToForm(company?.actualAddress)
        form.value = {
          name: company?.name ?? '',
          inn: company?.inn ?? '',
          kpp: company?.kpp ?? '',
          ogrn: company?.ogrn ?? '',
          phone: company?.phone ?? '',
          email: company?.email ?? '',
          website: company?.website ?? '',
          legalCountry: leg.country,
          legalCity: leg.city,
          legalStreet: leg.street,
          legalBuilding: leg.building,
          legalApartment: leg.apartment ?? '',
          actualCountry: act.country,
          actualCity: act.city,
          actualStreet: act.street,
          actualBuilding: act.building,
          actualApartment: act.apartment ?? '',
          tagsStr: company?.tags?.length ? company.tags.join(', ') : '',
        }
        sameAsLegal.value = false
      }
    },
    { immediate: true },
  )

  watch(sameAsLegal, (newValue) => {
    if (newValue) {
      form.value.actualCountry = form.value.legalCountry
      form.value.actualCity = form.value.legalCity
      form.value.actualStreet = form.value.legalStreet
      form.value.actualBuilding = form.value.legalBuilding
      form.value.actualApartment = form.value.legalApartment
    }
  })

  const handleSubmit = async () => {
    if (!form.value.name.trim()) return
    saving.value = true
    try {
      const legalAddress = formToAddress(
        form.value.legalCountry,
        form.value.legalCity,
        form.value.legalStreet,
        form.value.legalBuilding,
        form.value.legalApartment,
      )
      const actualAddress = sameAsLegal.value
        ? legalAddress
        : formToAddress(
            form.value.actualCountry,
            form.value.actualCity,
            form.value.actualStreet,
            form.value.actualBuilding,
            form.value.actualApartment,
          )
      const tags = form.value.tagsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const data: CreateCompanyDto = {
        name: form.value.name.trim(),
        inn: form.value.inn.trim() || undefined,
        kpp: form.value.kpp.trim() || undefined,
        ogrn: form.value.ogrn.trim() || undefined,
        phone: form.value.phone.trim() || undefined,
        email: form.value.email.trim() || undefined,
        website: form.value.website.trim() || undefined,
        legalAddress: legalAddress,
        actualAddress: actualAddress,
        tags: tags.length ? tags : undefined,
      }
      if (props.company) {
        emit('confirm', { id: props.company.id, data })
        emit('update', props.company.id, data)
      } else {
        emit('confirm', { data })
        emit('save', data)
      }
      emit('close')
    } finally {
      saving.value = false
    }
  }
</script>
