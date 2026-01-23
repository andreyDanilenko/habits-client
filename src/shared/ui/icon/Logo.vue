<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <defs>
      <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1" />
        <!-- indigo-500 -->
        <stop offset="100%" stop-color="#9333ea" />
        <!-- purple-600 -->
      </linearGradient>
    </defs>
    <rect width="32" height="32" :rx="borderRadius" :fill="`url(#${gradientId})`" />
    <text
      x="16"
      y="16"
      text-anchor="middle"
      dominant-baseline="central"
      fill="white"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-weight="bold"
      :font-size="fontSize"
      letter-spacing="0.5"
    >
      HF
    </text>
  </svg>
</template>

<script setup lang="ts">
  interface Props {
    size?: number | string
    className?: string
    borderRadius?: number
    fontSize?: number
  }

  withDefaults(defineProps<Props>(), {
    size: 32,
    className: '',
    borderRadius: 8,
    fontSize: 14,
  })

  // Генерируем уникальный ID для градиента, чтобы избежать конфликтов при множественном использовании
  const gradientId = `logoGrad-${Math.random().toString(36).substr(2, 9)}`
</script>
