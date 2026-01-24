<template>
  <div class="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2 flex-wrap">
    <Button
      type="button"
      variant="ghost"
      size="sm"
      @click="insert('**', '**')"
      title="Жирный (Ctrl+B)"
      class="font-semibold"
    >
      B
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      @click="insert('*', '*')"
      title="Курсив (Ctrl+I)"
      class="italic"
    >
      I
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      @click="insert('`', '`')"
      title="Код"
      class="font-mono"
    >
      &lt;/&gt;
    </Button>
    <div class="w-px h-6 bg-gray-300"></div>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      @click="insert('# ', '')"
      title="H1"
    >
      H1
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      @click="insert('## ', '')"
      title="H2"
    >
      H2
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      @click="insert('- ', '')"
      title="Список"
    >
      •
    </Button>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'

  interface Emits {
    (e: 'insert', before: string, after: string): void
  }

  const emit = defineEmits<Emits>()

  const insert = (before: string, after: string) => {
    emit('insert', before, after)
  }
</script>
