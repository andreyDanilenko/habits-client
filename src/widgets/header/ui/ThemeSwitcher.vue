<template>
  <Tooltip variant="dropdown" trigger="click" placement="bottom">
    <template #trigger>
      <Button
        variant="icon"
        icon-only
        :left-icon="currentIcon"
        :aria-label="ariaLabel"
        custom-class="rounded-lg"
      />
    </template>

    <div class="w-56 bg-bg-primary rounded-lg shadow-card border border-border-default">
      <button
        v-for="opt in options"
        :key="opt.mode"
        type="button"
        class="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-text-primary hover:bg-bg-tertiary transition-colors first:rounded-t-lg"
        :class="{ 'bg-primary-light text-primary-default': mode === opt.mode }"
        @click="setTheme(opt.mode)"
      >
        <component :is="opt.icon" class="w-4 h-4 flex-shrink-0" />
        <span class="flex-1 min-w-0">{{ opt.label }}</span>
        <CheckIcon v-if="mode === opt.mode" class="w-4 h-4 flex-shrink-0 text-primary-default" />
      </button>

      <div class="border-t border-border-light">
        <ThemeWorkspaceToggle />
      </div>
    </div>
  </Tooltip>
</template>

<script setup lang="ts">
  import { computed, h, type FunctionalComponent } from 'vue'
  import { useTheme, type ThemeMode } from '@/shared/lib/use-theme'
  import { Tooltip, Button } from '@/shared/ui'
  import { CheckIcon } from '@/shared/ui/icon'
  import ThemeWorkspaceToggle from './ThemeWorkspaceToggle.vue'

  const iconSvgAttrs = (attrs: Record<string, unknown>) => {
    const { size, class: c, ...rest } = attrs
    const sizeClass = size === 'sm' ? 'w-5 h-5' : size === 'xs' ? 'w-4 h-4' : 'w-5 h-5'
    return {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
      class: `${sizeClass} text-text-primary ${c || ''}`.trim(),
      ...rest,
    }
  }

  const SunIcon: FunctionalComponent = (_, { attrs }) =>
    h('svg', iconSvgAttrs(attrs as Record<string, unknown>), [
      h('path', {
        d: 'M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.111-1.014l-1.06 1.06a.75.75 0 001.011 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.111 1.014l1.06 1.06a.75.75 0 101.011-1.06l-1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.014-1.111l-1.06-1.06a.75.75 0 10-1.06 1.011l1.06 1.06zM5.404 6.464a.75.75 0 001.014 1.111l1.06-1.06a.75.75 0 10-1.011-1.06l-1.06 1.06z',
      }),
    ])

  const MoonIcon: FunctionalComponent = (_, { attrs }) =>
    h('svg', iconSvgAttrs(attrs as Record<string, unknown>), [
      h('path', {
        'fill-rule': 'evenodd',
        d: 'M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z',
        'clip-rule': 'evenodd',
      }),
    ])

  const { mode, setTheme } = useTheme()

  const options: { mode: ThemeMode; label: string; icon: FunctionalComponent }[] = [
    { mode: 'light', label: 'Светлая', icon: SunIcon },
    { mode: 'dark', label: 'Тёмная', icon: MoonIcon },
  ]

  const currentIcon = computed(() => (mode.value === 'dark' ? MoonIcon : SunIcon))

  const ariaLabel = computed(() => (mode.value === 'dark' ? 'Тема: тёмная' : 'Тема: светлая'))
</script>
