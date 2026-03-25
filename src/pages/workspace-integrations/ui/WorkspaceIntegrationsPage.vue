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
          <Badge
            v-if="item.id === 'telegram' && isTelegramStatusLoading"
            variant="blue"
          >
            Проверяем
          </Badge>
          <Badge v-else-if="item.id === 'telegram' && isTelegramLinked" variant="green">
            Подключен
          </Badge>
          <Badge v-else :variant="badgeVariant(item.status)">{{ statusLabel(item.status) }}</Badge>
        </div>

        <div class="pt-2 mt-auto border-t border-border-light">
          <template v-if="item.id === 'telegram'">
            <p class="text-xs text-text-secondary mb-2">
              Нажмите кнопку — откроется чат с ботом уже с вашим одноразовым ключом. В Telegram нажмите
              <strong class="text-text-primary">Start</strong>
              (вставлять ссылку вручную не нужно).
            </p>
            <div v-if="isTelegramStatusLoading" class="text-xs text-text-muted">
              Проверяем подключение Telegram...
            </div>
            <div v-else-if="isTelegramLinked" class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm text-text-primary font-medium">Telegram подключен</p>
                <p v-if="telegramChatId" class="text-xs text-text-muted mt-1">
                  chat_id: <span class="font-mono">{{ telegramChatId }}</span>
                </p>
              </div>
              <div class="flex items-center gap-2">
                <Button size="sm" variant="outline" @click="openTelegramChat">
                  Открыть чат
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  class="text-red-600 dark:text-red-400"
                  @click="unlinkTelegram"
                >
                  Отвязать
                </Button>
              </div>
            </div>
            <Button v-else size="sm" :loading="isConnectingTelegram" @click="connectTelegram">
              Открыть Telegram и подключить
            </Button>
            <p v-if="telegramConnectLink" class="text-xs text-text-muted mt-2">
              Не открылось?
              <a :href="telegramConnectLink" target="_blank" rel="noopener noreferrer" class="text-primary-default hover:underline">
                Открыть в новой вкладке
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
    unlinkTelegram,
    isTelegramLinked,
    telegramChatId,
    telegramBotUsername,
    isTelegramStatusLoading,
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

  function openTelegramChat() {
    if (!telegramBotUsername) {
      window.open('https://t.me/', '_blank', 'noopener,noreferrer')
      return
    }
    window.open(`https://t.me/${telegramBotUsername}`, '_blank', 'noopener,noreferrer')
  }
</script>
