<template>
  <div class="flex items-center gap-3 min-w-0">
    <div
      class="flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden bg-bg-tertiary text-text-secondary font-medium"
      :class="avatarSizeClasses"
    >
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        :alt="name || email"
        class="w-full h-full object-cover"
      />
      <span v-else class="select-none">{{ initials }}</span>
    </div>
    <div class="min-w-0 flex-1 space-y-0.5">
      <div class="font-medium text-text-primary truncate">
        {{ name || email || '—' }}
      </div>
      <div v-if="email && name" class="text-xs text-text-secondary truncate">
        {{ email }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  export type UserInfoSize = 'sm' | 'md' | 'lg'

  const props = withDefaults(
    defineProps<{
      name?: string
      email?: string
      avatarUrl?: string
      size?: UserInfoSize
    }>(),
    {
      size: 'md',
    },
  )

  const initials = computed(() => {
    if (props.name) {
      const parts = props.name.trim().split(/\s+/)
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      }
      return props.name.slice(0, 2).toUpperCase()
    }
    if (props.email) {
      const local = props.email.split('@')[0]
      return local.slice(0, 2).toUpperCase()
    }
    return '?'
  })

  const avatarSizeClasses = computed(() => {
    const sizes: Record<UserInfoSize, string> = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
    }
    return sizes[props.size]
  })
</script>
