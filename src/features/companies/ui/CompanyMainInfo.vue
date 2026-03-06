<template>
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

<script setup lang="ts">
  import CompanyRequisites from './CompanyRequisites.vue'
  import CompanyContactInfo from './CompanyContactInfo.vue'
  import CompanyAddresses from './CompanyAddresses.vue'
  import CompanyTags from './CompanyTags.vue'
  import CompanyResponsible from './CompanyResponsible.vue'
  import type { Company } from '@/entities/company'

  defineProps<{
    company: Company
  }>()
</script>
