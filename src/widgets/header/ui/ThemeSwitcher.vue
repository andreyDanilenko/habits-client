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
    h(
      'svg',
      {
        ...iconSvgAttrs(attrs as Record<string, unknown>),
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      },
      [
        h('circle', { cx: '12', cy: '12', r: '5' }),
        h('path', {
          d: 'M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
        }),
      ],
    )

  const MoonIcon: FunctionalComponent = (_, { attrs }) =>
    h(
      'svg',
      {
        ...iconSvgAttrs(attrs as Record<string, unknown>),
        viewBox: '0 0 24 24',
        fill: 'currentColor',
      },
      [
        h('path', {
          d: 'M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z',
        }),
      ],
    )

  const { mode, setTheme } = useTheme()

  const options: { mode: ThemeMode; label: string; icon: FunctionalComponent }[] = [
    { mode: 'light', label: 'Светлая', icon: SunIcon },
    { mode: 'dark', label: 'Тёмная', icon: MoonIcon },
  ]

  const currentIcon = computed(() => (mode.value === 'dark' ? MoonIcon : SunIcon))

  const ariaLabel = computed(() => (mode.value === 'dark' ? 'Тема: тёмная' : 'Тема: светлая'))
</script>
