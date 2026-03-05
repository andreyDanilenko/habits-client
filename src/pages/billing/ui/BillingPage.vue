<template>
  <div class="min-h-screen bg-gradient-to-b bg-bg-primary">
    <div class="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <!-- Hero -->
      <header class="text-center mb-12">
        <h1 class="text-3xl font-bold text-text-primary tracking-tight sm:text-4xl">
          Биллинг и лицензии
        </h1>
        <p class="mt-3 text-lg text-text-secondary max-w-2xl mx-auto">
          Покупка модулей привязана к аккаунту: один раз купили — используете во всех своих
          воркспейсах или только в выбранном, в зависимости от тарифа.
        </p>
      </header>

      <!-- Мои лицензии (кратко) -->
      <section v-if="licensesCount > 0" class="mb-10">
        <Card
          class="p-5 border border-primary-light bg-primary-light/30"
          :shadow="true"
          :border="true"
        >
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary-default"
              >
                <span class="text-lg font-semibold">{{ licensesCount }}</span>
              </div>
              <div>
                <h2 class="font-semibold text-text-primary">Активных лицензий</h2>
                <p class="text-sm text-text-secondary">
                  Доступно для включения в настройках воркспейса
                </p>
              </div>
            </div>
            <Button variant="outline" size="md" @click="$router.push('/workspace-settings')">
              Настройки воркспейса
            </Button>
          </div>
        </Card>
      </section>

      <!-- Способы оплаты -->
      <section class="mb-12">
        <h2 class="text-xl font-semibold text-text-primary mb-1">Способы оплаты</h2>
        <p class="text-sm text-text-muted mb-5">
          После выбора модуля и тарифа будет доступна оплата одним из способов ниже.
        </p>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="method in paymentMethods"
            :key="method.id"
            class="group relative flex flex-col items-center rounded-xl border border-border-light bg-bg-primary p-6 shadow-sm transition-all hover:border-primary-light hover:shadow-md"
          >
            <div
              class="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-bg-tertiary text-2xl transition-colors group-hover:bg-primary-light"
            >
              {{ method.icon }}
            </div>
            <span class="font-medium text-text-primary">{{ method.name }}</span>
            <span class="mt-0.5 text-center text-xs text-text-muted">{{ method.note }}</span>
            <Button variant="outline" size="md" disabled class="mt-4 w-full">
              {{ method.buttonLabel }}
            </Button>
          </div>
        </div>
      </section>

      <!-- Модули и тарифы -->
      <section>
        <h2 class="text-xl font-semibold text-text-primary mb-1">Модули и тарифы</h2>
        <p class="text-sm text-text-muted mb-8">
          Тестовые данные. Лицензия «все воркспейсы» — один раз купили, используете везде; «один
          воркспейс» — только для выбранного workspace.
        </p>

        <div class="space-y-8">
          <article
            v-for="item in billingModules"
            :key="item.id"
            :ref="(el) => setModuleRef(item.id, el)"
            class="overflow-hidden rounded-2xl border bg-bg-primary shadow-sm transition-all duration-300"
            :class="[
              highlightModuleId === item.id
                ? 'border-primary-default ring-2 ring-primary-default/20 shadow-md'
                : 'border-border-light hover:border-border-hover',
            ]"
          >
            <!-- Заголовок модуля -->
            <div class="border-b border-border-light bg-bg-secondary/50 px-6 py-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-11 w-11 items-center justify-center rounded-xl text-2xl"
                    :class="
                      item.isFree
                        ? 'bg-success-light text-success-dark'
                        : 'bg-primary-light text-primary-default'
                    "
                  >
                    {{ item.emoji }}
                  </div>
                  <div>
                    <h3 class="font-semibold text-text-primary">{{ item.label }}</h3>
                    <p class="text-sm text-text-muted">{{ item.description }}</p>
                  </div>
                </div>
                <Badge v-if="item.isFree" variant="green">Бесплатно</Badge>
              </div>
            </div>

            <!-- Планы -->
            <div class="p-6">
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div
                  v-for="plan in item.plans"
                  :key="plan.id"
                  class="relative flex flex-col rounded-xl border p-5 transition-colors"
                  :class="
                    plan.popular
                      ? 'border-primary-light bg-primary-light/30'
                      : 'border-border-light bg-bg-primary hover:bg-bg-secondary'
                  "
                >
                  <Badge v-if="plan.popular" variant="indigo" class="absolute -top-2.5 right-3">
                    Популярный
                  </Badge>
                  <span class="text-sm font-medium text-text-secondary">{{ plan.name }}</span>
                  <span
                    class="mt-2 text-2xl font-bold tracking-tight"
                    :class="plan.isFree ? 'text-success-default' : 'text-primary-default'"
                  >
                    {{ plan.price }}
                  </span>
                  <span class="mt-0.5 text-xs text-text-muted">{{ plan.note }}</span>
                  <Button
                    variant="outline"
                    size="md"
                    :class="
                      plan.popular
                        ? 'border-primary-light text-primary-dark hover:bg-primary-light'
                        : ''
                    "
                    disabled
                    class="mt-4 w-full"
                  >
                    {{ plan.isFree ? 'Уже доступен' : 'Выбрать (заглушка)' }}
                  </Button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Связь с владельцем -->
      <section class="mt-12">
        <Card
          class="overflow-hidden border-2 border-warning-border bg-gradient-to-br from-warning-light to-orange-50/50 p-6"
          :shadow="true"
          :border="true"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-start gap-4">
              <div
                class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-warning-light text-2xl"
              >
                📬
              </div>
              <div>
                <h2 class="font-semibold text-warning-text">Индивидуальные условия</h2>
                <p class="mt-1 text-sm text-warning-text/80">
                  Корпоративная лицензия, особые тарифы или оплата по счёту — свяжитесь с владельцем
                  приложения. После договорённости доступ к модулю будет выдан вручную (админ).
                </p>
              </div>
            </div>
            <Button variant="secondary" disabled class="flex-shrink-0">
              Связаться с владельцем (заглушка)
            </Button>
          </div>
        </Card>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick, watch, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { Card, Button, Badge } from '@/shared/ui'
  import { useWorkspaceStore } from '@/entities/workspace'

  const route = useRoute()
  const workspaceStore = useWorkspaceStore()
  const highlightModuleId = ref<string | null>(null)
  const moduleRefs = ref<Record<string, HTMLElement | null>>({})

  const licensesCount = computed(() => workspaceStore.licenses?.length ?? 0)

  function setModuleRef(id: string, el: unknown) {
    moduleRefs.value[id] = el as HTMLElement | null
  }

  function scrollToModule(moduleCode: string) {
    const el = moduleRefs.value[moduleCode]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      highlightModuleId.value = moduleCode
      setTimeout(() => {
        highlightModuleId.value = null
      }, 2500)
    }
  }

  onMounted(() => {
    workspaceStore.loadLicenses?.()
    const module = route.query.module
    const code = Array.isArray(module) ? module[0] : module
    if (code) {
      nextTick(() => scrollToModule(code))
    }
  })

  watch(
    () => route.query.module,
    (module) => {
      const code = Array.isArray(module) ? module[0] : module
      if (code) nextTick(() => scrollToModule(code))
    },
  )

  const paymentMethods = [
    {
      id: 'card',
      name: 'Банковская карта',
      note: 'Visa, Mastercard, МИР',
      icon: '💳',
      buttonLabel: 'Оплатить картой',
    },
    {
      id: 'sbp',
      name: 'СБП',
      note: 'Система быстрых платежей',
      icon: '📱',
      buttonLabel: 'Оплатить через СБП',
    },
    {
      id: 'qr',
      name: 'QR-оплата',
      note: 'Сканирование QR-кода',
      icon: '📷',
      buttonLabel: 'Показать QR',
    },
    {
      id: 'invoice',
      name: 'По счёту',
      note: 'Для юр. лиц',
      icon: '📄',
      buttonLabel: 'Запросить счёт',
    },
  ]

  const billingModules = [
    {
      id: 'habits',
      label: 'Привычки',
      description: 'Трекер привычек, календарь, дневник.',
      emoji: '✅',
      isFree: true,
      plans: [
        {
          id: 'habits-core',
          name: 'Базовый',
          price: 'Бесплатно',
          note: 'Core-модуль по умолчанию',
          isFree: true,
          popular: false,
        },
      ],
    },
    {
      id: 'crm',
      label: 'CRM',
      description: 'Контакты и сделки.',
      emoji: '👥',
      isFree: false,
      plans: [
        {
          id: 'crm-sub-month',
          name: 'Подписка, месяц',
          price: '299 ₽/мес',
          note: 'Для всех ваших воркспейсов',
          isFree: false,
          popular: true,
        },
        {
          id: 'crm-sub-year',
          name: 'Подписка, год',
          price: '2 990 ₽/год',
          note: 'Экономия 2 месяца',
          isFree: false,
          popular: false,
        },
        {
          id: 'crm-perpetual-all',
          name: 'Вечная, все воркспейсы',
          price: '9 990 ₽',
          note: 'Один раз, везде',
          isFree: false,
          popular: false,
        },
        {
          id: 'crm-perpetual-one',
          name: 'Вечная, один воркспейс',
          price: '4 990 ₽',
          note: 'Только выбранный workspace',
          isFree: false,
          popular: false,
        },
      ],
    },
    {
      id: 'notes',
      label: 'Заметки',
      description: 'Простые заметки по воркспейсу.',
      emoji: '📝',
      isFree: false,
      plans: [
        {
          id: 'notes-sub-month',
          name: 'Подписка, месяц',
          price: '99 ₽/мес',
          note: 'Для всех воркспейсов',
          isFree: false,
          popular: true,
        },
        {
          id: 'notes-perpetual-all',
          name: 'Вечная, все воркспейсы',
          price: '1 990 ₽',
          note: 'Один раз, везде',
          isFree: false,
          popular: false,
        },
      ],
    },
    {
      id: 'inventory',
      label: 'Склад',
      description: 'Учёт остатков и номенклатуры (в разработке).',
      emoji: '📦',
      isFree: false,
      plans: [
        {
          id: 'inventory-sub-month',
          name: 'Подписка, месяц',
          price: '499 ₽/мес',
          note: 'Для всех воркспейсов',
          isFree: false,
          popular: true,
        },
        {
          id: 'inventory-perpetual-all',
          name: 'Вечная, все воркспейсы',
          price: '14 990 ₽',
          note: 'Один раз, везде',
          isFree: false,
          popular: false,
        },
      ],
    },
    {
      id: 'finance',
      label: 'Финансы',
      description: 'Проводки и отчёты (в разработке).',
      emoji: '💰',
      isFree: false,
      plans: [
        {
          id: 'finance-sub-month',
          name: 'Подписка, месяц',
          price: '599 ₽/мес',
          note: 'Для всех воркспейсов',
          isFree: false,
          popular: true,
        },
        {
          id: 'finance-perpetual-all',
          name: 'Вечная, все воркспейсы',
          price: '19 990 ₽',
          note: 'Один раз, везде',
          isFree: false,
          popular: false,
        },
      ],
    },
    {
      id: 'hr',
      label: 'HR',
      description: 'Сотрудники и роли (в разработке).',
      emoji: '👔',
      isFree: false,
      plans: [
        {
          id: 'hr-sub-month',
          name: 'Подписка, месяц',
          price: '399 ₽/мес',
          note: 'Для всех воркспейсов',
          isFree: false,
          popular: false,
        },
        {
          id: 'hr-perpetual-all',
          name: 'Вечная, все воркспейсы',
          price: '9 990 ₽',
          note: 'Один раз, везде',
          isFree: false,
          popular: false,
        },
      ],
    },
  ]
</script>
