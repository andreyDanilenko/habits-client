<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <div>
      <router-link
        to="/workspace-settings"
        class="text-sm text-primary-default hover:text-primary-dark font-medium inline-flex items-center gap-1 mb-3"
      >
        ← Настройки workspace
      </router-link>
      <h1 class="text-text-primary">Интеграции</h1>
      <p class="mt-2 text-sm text-text-secondary max-w-2xl">
        Каталог подключений воркспейса. Здесь будет единая точка для OAuth, webhook’ов и внешних
        сервисов; сейчас отображается дорожная карта и одна рабочая интеграция.
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <Card
        v-for="item in WORKSPACE_INTEGRATION_CATALOG"
        :key="item.id"
        class="p-5 flex flex-col gap-3 border border-border-light"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-text-primary font-semibold">{{ item.name }}</h2>
            <p class="text-sm text-text-secondary mt-1">{{ item.description }}</p>
          </div>
          <Badge :variant="badgeVariant(item.status)">{{ statusLabel(item.status) }}</Badge>
        </div>

        <div class="pt-2 mt-auto border-t border-border-light">
          <template v-if="item.id === 'telegram'">
            <Button size="sm" :loading="isConnectingTelegram" @click="connectTelegram">
              Подключить Telegram
            </Button>
            <p v-if="telegramConnectLink" class="text-xs text-text-muted break-all mt-2">
              Ссылка:
              <a :href="telegramConnectLink" target="_blank" class="text-primary-default hover:underline">
                {{ telegramConnectLink }}
              </a>
            </p>
            <p v-if="telegramConnectError" class="text-xs text-red-600 dark:text-red-400 mt-2">
              {{ telegramConnectError }}
            </p>
          </template>
          <template v-else>
            <Button size="sm" variant="outline" :disabled="true" :title="stubTitle">
              Скоро
            </Button>
          </template>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { WORKSPACE_INTEGRATION_CATALOG } from '../lib/integration-catalog'
  import type { IntegrationCatalogStatus } from '../lib/integration-catalog'
  import { Card, Button, Badge } from '@/shared/ui'
  import { useTelegramIntegrationLink } from '@/features/workspace/model'

  const {
    isConnectingTelegram,
    telegramConnectLink,
    telegramConnectError,
    connectTelegram,
  } = useTelegramIntegrationLink()

  const stubTitle = 'Подключение появится в следующих релизах'

  function statusLabel(status: IntegrationCatalogStatus): string {
    if (status === 'available') return 'Доступно'
    if (status === 'coming_soon') return 'Скоро'
    return 'В планах'
  }

  function badgeVariant(
    status: IntegrationCatalogStatus,
  ): 'green' | 'blue' | 'default' {
    if (status === 'available') return 'green'
    if (status === 'coming_soon') return 'blue'
    return 'default'
  }
</script>
