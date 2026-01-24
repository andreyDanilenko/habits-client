<template>
  <div class="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2 flex-wrap">
    <button
      type="button"
      @click="insert('**', '**')"
      class="px-3 py-1 text-sm font-semibold hover:bg-gray-200 rounded transition-colors"
      title="Жирный (Ctrl+B)"
    >
      B
    </button>
    <button
      type="button"
      @click="insert('*', '*')"
      class="px-3 py-1 text-sm italic hover:bg-gray-200 rounded transition-colors"
      title="Курсив (Ctrl+I)"
    >
      I
    </button>
    <button
      type="button"
      @click="insert('`', '`')"
      class="px-3 py-1 text-sm font-mono hover:bg-gray-200 rounded transition-colors"
      title="Код"
    >
      &lt;/&gt;
    </button>
    <div class="w-px h-6 bg-gray-300"></div>
    <button
      type="button"
      @click="insert('# ', '')"
      class="px-3 py-1 text-sm hover:bg-gray-200 rounded transition-colors"
      title="H1"
    >
      H1
    </button>
    <button
      type="button"
      @click="insert('## ', '')"
      class="px-3 py-1 text-sm hover:bg-gray-200 rounded transition-colors"
      title="H2"
    >
      H2
    </button>
    <button
      type="button"
      @click="insert('- ', '')"
      class="px-3 py-1 text-sm hover:bg-gray-200 rounded transition-colors"
      title="Список"
    >
      •
    </button>
  </div>
</template>

<script setup lang="ts">
  interface Emits {
    (e: 'insert', before: string, after: string): void
  }

  const emit = defineEmits<Emits>()

  const insert = (before: string, after: string) => {
    emit('insert', before, after)
  }
</script>
