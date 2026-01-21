<template>
  <div class="relative inline-block">
    <div
      ref="triggerRef"
      @click="toggle"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      class="cursor-pointer"
    >
      <slot name="trigger" />
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="tooltipRef"
        class="fixed z-50 bg-white border rounded shadow-lg pointer-events-auto min-w-[150px]"
        :style="tooltipStyle"
        @mouseenter="keepOpen = true"
        @mouseleave="onTooltipMouseLeave"
        @click.stop
      >
        <div class="p-3">
          <slot>{{ text }}</slot>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  text?: string
  trigger?: 'hover' | 'click'
  placement?: 'bottom' | 'top' | 'left' | 'right'
  width?: string
}>()

const isOpen = ref(false)
const keepOpen = ref(false)
const triggerRef = ref<HTMLElement>()
const tooltipRef = ref<HTMLElement>()
const tooltipStyle = ref({
  top: '0px',
  left: '0px',
  width: props.width || 'auto',
  minWidth: '150px'
})

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

const positionTooltip = () => {
  if (!triggerRef.value || !tooltipRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const padding = 8

  let top = 0
  let left = 0

  // Базовое позиционирование относительно триггера
  switch (props.placement || 'bottom') {
    case 'bottom':
      top = rect.bottom + 5
      left = rect.left + rect.width / 2 - tooltipRect.width / 2
      break
    case 'top':
      top = rect.top - tooltipRect.height - 5
      left = rect.left + rect.width / 2 - tooltipRect.width / 2
      break
    case 'left':
      top = rect.top + rect.height / 2 - tooltipRect.height / 2
      left = rect.left - tooltipRect.width - 5
      break
    case 'right':
      top = rect.top + rect.height / 2 - tooltipRect.height / 2
      left = rect.right + 5
      break
  }

  const maxLeft = viewportWidth - tooltipRect.width - padding
  const minLeft = padding
  const maxTop = viewportHeight - tooltipRect.height - padding
  const minTop = padding

  left = Math.min(Math.max(left, minLeft), Math.max(minLeft, maxLeft))
  top = Math.min(Math.max(top, minTop), Math.max(minTop, maxTop))

  tooltipStyle.value = {
    ...tooltipStyle.value,
    top: `${top}px`,
    left: `${left}px`
  }
}

const open = () => {
  isOpen.value = true
  nextTick(() => {
    positionTooltip()
    if (props.width && tooltipRef.value) {
      tooltipRef.value.style.width = props.width
      positionTooltip()
    }
  })
}

const close = () => {
  isOpen.value = false
  keepOpen.value = false
}

const toggle = (e: Event) => {
  e.stopPropagation()
  if (props.trigger === 'click') {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      nextTick(() => {
        positionTooltip()
      })
    }
  }
}

const onMouseEnter = () => {
  if (props.trigger === 'hover') {
    keepOpen.value = true
    open()
  }
}

const onMouseLeave = () => {
  if (props.trigger === 'hover') {
    keepOpen.value = false
    setTimeout(() => {
      if (!keepOpen.value) {
        close()
      }
    }, 100)
  }
}

const onTooltipMouseLeave = () => {
  if (props.trigger === 'hover') {
    keepOpen.value = false
    setTimeout(() => {
      if (!keepOpen.value) {
        close()
      }
    }, 100)
  }
}

const onClickOutside = (e: MouseEvent) => {
  if (props.trigger !== 'click' || !isOpen.value) return

  if (
    !triggerRef.value?.contains(e.target as Node) &&
    !tooltipRef.value?.contains(e.target as Node)
  ) {
    close()
  }
}

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

watch(
  () => props.width,
  (newWidth) => {
    if (tooltipRef.value && newWidth) {
      tooltipStyle.value.width = newWidth
      if (isOpen.value) {
        nextTick(positionTooltip)
      }
    }
  }
)
</script>
