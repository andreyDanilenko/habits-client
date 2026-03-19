# Техническая спецификация: Модуль активностей (Activity Feed)

## 1. Общая архитектура

### 1.1. Технологический стек

- **Фреймворк**: Vue 3 (Composition API)
- **Редактор**: Tiptap 2.x
- **Типизация**: TypeScript
- **Стилизация**: TailwindCSS (или CSS Modules)
- **Управление состоянием**: Pinia (опционально)

### 1.2. Структура модуля

```
src/modules/activity/
├── components/
│   ├── ActivityFeed.vue          # Основной контейнер
│   ├── ActivityItem.vue           # Элемент активности
│   ├── ActivityEditor.vue         # Редактор
│   ├── EditorToolbar.vue          # Тулубар
│   └── blocks/                    # Кастомные блоки
│       ├── BannerBlock.vue
│       ├── CalloutBlock.vue
│       ├── TaskListBlock.vue
│       └── TableBlock.vue
├── extensions/                    # Tiptap extensions
│   ├── slash-command.ts
│   ├── banner-extension.ts
│   ├── callout-extension.ts
│   └── task-item-extension.ts
├── composables/
│   ├── useActivityEditor.ts
│   └── useMentions.ts
├── types/
│   └── activity.types.ts
└── stores/
    └── activityStore.ts
```

## 2. Основные компоненты

### 2.1. ActivityEditor.vue - Ядро редактора

```typescript
// types/activity.types.ts
export interface ActivityEditorProps {
  placeholder?: string
  initialContent?: RichContent
  readOnly?: boolean
  maxHeight?: string
  autoFocus?: boolean
  mentionableUsers?: User[]
  mentionableTasks?: Task[]
}

export interface RichContent {
  type: 'doc'
  content: Block[]
}

export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'banner'
  | 'callout'
  | 'taskList'
  | 'table'
  | 'bulletList'
  | 'codeBlock'

export interface Block {
  type: BlockType
  content?: any[]
  attrs?: Record<string, any>
}
```

```vue
<!-- components/ActivityEditor.vue -->
<template>
  <div
    ref="editorContainer"
    class="activity-editor"
    :class="{ 'is-focused': isFocused }"
    :style="{ maxHeight }"
  >
    <EditorToolbar v-if="showToolbar" :editor="editor" @block-insert="handleBlockInsert" />

    <editor-content :editor="editor" class="editor-content" />

    <!-- Slash Command Menu -->
    <SlashCommandMenu
      :editor="editor"
      :visible="showSlashMenu"
      :position="slashMenuPosition"
      @command="executeSlashCommand"
    />

    <!-- Mention Menu -->
    <MentionMenu
      :editor="editor"
      :visible="showMentionMenu"
      :users="mentionableUsers"
      :tasks="mentionableTasks"
      @select="handleMentionSelect"
    />
  </div>
</template>

<script setup lang="ts">
  import { useEditor, EditorContent } from '@tiptap/vue-3'
  import { computed, ref, watch } from 'vue'
  import StarterKit from '@tiptap/starter-kit'
  import Placeholder from '@tiptap/extension-placeholder'
  import Mention from '@tiptap/extension-mention'
  import TaskList from '@tiptap/extension-task-list'
  import TaskItem from '@tiptap/extension-task-item'
  import Table from '@tiptap/extension-table'
  import TableRow from '@tiptap/extension-table-row'
  import TableCell from '@tiptap/extension-table-cell'
  import TableHeader from '@tiptap/extension-table-header'
  import Highlight from '@tiptap/extension-highlight'
  import Color from '@tiptap/extension-color'
  import TextStyle from '@tiptap/extension-text-style'
  import Link from '@tiptap/extension-link'

  // Кастомные расширения
  import { BannerExtension } from '../extensions/banner-extension'
  import { CalloutExtension } from '../extensions/callout-extension'
  import { SlashCommand } from '../extensions/slash-command'

  const props = defineProps<ActivityEditorProps>()
  const emit = defineEmits<{
    (e: 'update:content', content: RichContent): void
    (e: 'focus'): void
    (e: 'blur'): void
    (e: 'mention:user', user: User): void
    (e: 'mention:task', task: Task): void
  }>()

  const isFocused = ref(false)
  const showSlashMenu = ref(false)
  const slashMenuPosition = ref({ top: 0, left: 0 })

  // Инициализация редактора
  const editor = useEditor({
    content: props.initialContent,
    editable: !props.readOnly,
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder: props.placeholder || 'Напишите комментарий или используйте "/" для команд...',
        emptyEditorClass: 'is-editor-empty',
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-primary-500 hover:underline cursor-pointer',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      BannerExtension,
      CalloutExtension,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          items: ({ query }) => {
            // Поиск пользователей/задач
            return searchMentions(query, props.mentionableUsers, props.mentionableTasks)
          },
          render: () => {
            // Рендеринг меню упоминаний
            return {
              onStart: (props) => {
                showMentionMenu.value = true
                // Позиционирование меню
              },
              onExit: () => {
                showMentionMenu.value = false
              },
            }
          },
        },
      }),
      SlashCommand.configure({
        suggestion: {
          items: ({ query }) => getSlashCommands(query),
          render: () => ({
            onStart: (props) => {
              showSlashMenu.value = true
              slashMenuPosition.value = getCursorPosition(props.editor)
            },
            onExit: () => {
              showSlashMenu.value = false
            },
          }),
        },
      }),
    ],
    onUpdate: ({ editor }) => {
      emit('update:content', editor.getJSON())
    },
    onFocus: () => {
      isFocused.value = true
      emit('focus')
    },
    onBlur: () => {
      isFocused.value = false
      emit('blur')
    },
  })

  // Команды для слэш-меню
  const getSlashCommands = (query: string) => {
    const commands = [
      {
        title: 'Баннер',
        description: 'Вставить цветной баннер',
        icon: '🎨',
        command: 'insertBanner',
        category: 'blocks',
      },
      {
        title: 'Callout',
        description: 'Вставить заметку с иконкой',
        icon: '💬',
        command: 'insertCallout',
        category: 'blocks',
      },
      {
        title: 'Чек-лист',
        description: 'Список задач',
        icon: '✅',
        command: 'insertTaskList',
        category: 'lists',
      },
      {
        title: 'Таблица',
        description: 'Вставить таблицу',
        icon: '📊',
        command: 'insertTable',
        category: 'blocks',
      },
      {
        title: 'Заголовок 1',
        description: 'Крупный заголовок',
        icon: 'H1',
        command: 'heading1',
        category: 'headings',
      },
      {
        title: 'Заголовок 2',
        description: 'Средний заголовок',
        icon: 'H2',
        command: 'heading2',
        category: 'headings',
      },
      {
        title: 'Маркированный список',
        description: 'Список с точками',
        icon: '•',
        command: 'bulletList',
        category: 'lists',
      },
      {
        title: 'Код',
        description: 'Блок кода',
        icon: '</>',
        command: 'codeBlock',
        category: 'blocks',
      },
    ]

    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description.toLowerCase().includes(query.toLowerCase()),
    )
  }

  // Выполнение команды
  const executeSlashCommand = (command: string) => {
    if (!editor.value) return

    switch (command) {
      case 'insertBanner':
        editor.value.commands.insertContent({
          type: 'banner',
          attrs: {
            variant: 'info',
            title: 'Важная информация',
            content: 'Текст баннера',
          },
        })
        break
      case 'insertCallout':
        editor.value.commands.insertContent({
          type: 'callout',
          attrs: {
            emoji: '💡',
            backgroundColor: 'bg-blue-50',
          },
        })
        break
      case 'insertTaskList':
        editor.value.commands.insertTaskList()
        break
      case 'insertTable':
        editor.value.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        break
      case 'heading1':
        editor.value.commands.toggleHeading({ level: 1 })
        break
      // ... остальные команды
    }

    showSlashMenu.value = false
  }
</script>

<style scoped>
  .activity-editor {
    @apply border rounded-lg bg-white overflow-hidden;
  }

  .editor-content {
    @apply p-4 min-h-[120px] prose max-w-none;
  }

  .editor-content :deep(.ProseMirror) {
    @apply outline-none;
  }

  .editor-content :deep(.is-editor-empty:first-child::before) {
    @apply text-gray-400 float-left h-0 pointer-events-none;
    content: attr(data-placeholder);
  }

  .editor-content :deep(.mention) {
    @apply bg-primary-100 text-primary-800 rounded px-1 py-0.5;
  }

  .editor-content :deep(.task-item) {
    @apply flex items-start gap-2;
  }

  .editor-content :deep(.task-item label) {
    @apply mt-1;
  }
</style>
```

### 2.2. Кастомный блок: BannerBlock.vue

```vue
<!-- components/blocks/BannerBlock.vue -->
<template>
  <div
    class="banner-block rounded-lg p-4 my-2 flex items-start gap-3"
    :class="variantClasses"
    :data-variant="variant"
    contenteditable="false"
  >
    <!-- Иконка (если есть) -->
    <div v-if="icon" class="banner-icon text-xl">
      {{ icon }}
    </div>

    <!-- Контент -->
    <div class="banner-content flex-1">
      <div
        v-if="title"
        class="banner-title font-medium mb-1"
        contenteditable="true"
        @input="updateTitle"
      >
        {{ title }}
      </div>
      <div class="banner-text" contenteditable="true" @input="updateContent">
        {{ content }}
      </div>
    </div>

    <!-- Кнопка закрытия/действия -->
    <button
      v-if="dismissible"
      class="banner-close text-gray-400 hover:text-gray-600"
      @click="dismiss"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{
    variant?: 'info' | 'success' | 'warning' | 'error'
    title?: string
    content?: string
    icon?: string
    dismissible?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:title', value: string): void
    (e: 'update:content', value: string): void
    (e: 'dismiss'): void
  }>()

  const variantClasses = computed(
    () =>
      ({
        info: 'bg-blue-50 border-l-4 border-blue-500',
        success: 'bg-green-50 border-l-4 border-green-500',
        warning: 'bg-yellow-50 border-l-4 border-yellow-500',
        error: 'bg-red-50 border-l-4 border-red-500',
      })[props.variant || 'info'],
  )

  const updateTitle = (e: Event) => {
    emit('update:title', (e.target as HTMLElement).innerText)
  }

  const updateContent = (e: Event) => {
    emit('update:content', (e.target as HTMLElement).innerText)
  }

  const dismiss = () => {
    emit('dismiss')
  }
</script>
```

### 2.3. Расширение для баннера

```typescript
// extensions/banner-extension.ts
import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import BannerBlock from '../components/blocks/BannerBlock.vue'

export const BannerExtension = Node.create({
  name: 'banner',

  group: 'block',

  content: 'inline*',

  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'info',
        parseHTML: (element) => element.getAttribute('data-variant'),
        renderHTML: (attributes) => ({
          'data-variant': attributes.variant,
        }),
      },
      title: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => ({
          'data-title': attributes.title,
        }),
      },
      icon: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-icon'),
        renderHTML: (attributes) => ({
          'data-icon': attributes.icon,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-banner]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-banner': '', ...HTMLAttributes }, 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(BannerBlock)
  },
})
```

### 2.4. Композабл для переиспользования

```typescript
// composables/useActivityEditor.ts
import { ref } from 'vue'
import type { ActivityEditorProps, RichContent } from '../types/activity.types'

export function useActivityEditor(options?: Partial<ActivityEditorProps>) {
  const editorRef = ref<InstanceType<typeof ActivityEditor> | null>(null)
  const content = ref<RichContent | null>(null)

  // Методы для управления редактором
  const focus = () => {
    editorRef.value?.focus()
  }

  const clear = () => {
    editorRef.value?.clear()
  }

  const insertBlock = (type: string, attrs?: any) => {
    editorRef.value?.insertBlock(type, attrs)
  }

  const getContent = () => {
    return editorRef.value?.getContent()
  }

  const setContent = (newContent: RichContent) => {
    editorRef.value?.setContent(newContent)
  }

  // Команды для быстрой вставки
  const commands = {
    insertBanner: (attrs?: any) => insertBlock('banner', attrs),
    insertCallout: (attrs?: any) => insertBlock('callout', attrs),
    insertTable: (rows: number = 3, cols: number = 3) => editorRef.value?.insertTable(rows, cols),
    insertTaskList: () => editorRef.value?.insertTaskList(),
    insertMention: (user: User) => editorRef.value?.insertMention(user),
  }

  return {
    editorRef,
    content,
    focus,
    clear,
    getContent,
    setContent,
    commands,
  }
}
```

### 2.5. ActivityFeed.vue - Основной компонент

```vue
<!-- components/ActivityFeed.vue -->
<template>
  <div class="activity-feed">
    <!-- Заголовок -->
    <div class="feed-header flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">Активность</h3>
      <button v-if="canAddComment" class="btn btn-sm btn-primary" @click="startNewComment">
        + Комментарий
      </button>
    </div>

    <!-- Список активностей -->
    <div class="feed-items space-y-4">
      <ActivityItem
        v-for="activity in activities"
        :key="activity.id"
        :activity="activity"
        @reply="replyToActivity"
        @edit="editActivity"
        @delete="deleteActivity"
      />
    </div>

    <!-- Редактор нового комментария -->
    <div v-if="showNewComment" class="new-comment mt-4">
      <ActivityEditor
        ref="newCommentEditor"
        v-model:content="newCommentContent"
        placeholder="Напишите комментарий... Используйте @ для упоминания, / для команд"
        :mentionable-users="teamMembers"
        :mentionable-tasks="relatedTasks"
        @mention:user="handleMentionUser"
        @mention:task="handleMentionTask"
      />

      <!-- Кнопки действий -->
      <div class="editor-actions flex justify-end gap-2 mt-2">
        <button class="btn btn-sm btn-secondary" @click="cancelNewComment">Отмена</button>
        <button class="btn btn-sm btn-primary" :disabled="!canSubmitComment" @click="submitComment">
          Отправить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import ActivityItem from './ActivityItem.vue'
  import ActivityEditor from './ActivityEditor.vue'
  import { useActivityStore } from '../stores/activityStore'

  const props = defineProps<{
    entityId: string // ID объекта (задача, проект и т.д.)
    entityType: 'task' | 'project' | 'document'
    teamMembers?: User[]
    relatedTasks?: Task[]
  }>()

  const activityStore = useActivityStore()
  const showNewComment = ref(false)
  const newCommentContent = ref(null)
  const newCommentEditor = ref(null)

  // Загрузка активностей
  const activities = computed(() =>
    activityStore.getActivitiesByEntity(props.entityId, props.entityType),
  )

  const canSubmitComment = computed(() => {
    // Проверка наличия контента
    return newCommentContent.value && newCommentContent.value.content?.length > 0
  })

  const startNewComment = () => {
    showNewComment.value = true
    // Фокус на редакторе после рендера
    nextTick(() => {
      newCommentEditor.value?.focus()
    })
  }

  const submitComment = async () => {
    await activityStore.createActivity({
      entityId: props.entityId,
      entityType: props.entityType,
      content: newCommentContent.value,
      author: currentUser.value,
    })

    // Сброс состояния
    newCommentContent.value = null
    showNewComment.value = false
  }

  const cancelNewComment = () => {
    showNewComment.value = false
    newCommentContent.value = null
  }

  const handleMentionUser = (user: User) => {
    // Логика упоминания пользователя
    console.log('Mentioned user:', user)
  }

  const handleMentionTask = (task: Task) => {
    // Логика упоминания задачи
    console.log('Mentioned task:', task)
  }

  const replyToActivity = (activity: Activity) => {
    // Ответ на конкретную активность
    showNewComment.value = true
    // Можно предзаполнить упоминание
    newCommentEditor.value?.insertMention(activity.author)
  }

  const editActivity = (activity: Activity) => {
    // Редактирование активности
  }

  const deleteActivity = async (activityId: string) => {
    await activityStore.deleteActivity(activityId)
  }
</script>
```

## 3. Ключевые особенности реализации

### 3.1. Переиспользуемость модуля

- Все компоненты спроектированы как независимые
- Композабл `useActivityEditor` позволяет использовать редактор в любом месте
- Конфигурация через пропсы и слоты

### 3.2. Производительность

- Ленивая загрузка тяжелых расширений
- Виртуализация списка активностей при необходимости
- Debounce при вводе для предотвращения лишних ререндеров

### 3.3. Расширяемость

- Легко добавлять новые блоки (достаточно создать extension + Vue компонент)
- Кастомизация через темы и CSS переменные
- Возможность подключать плагины

### 3.4. Безопасность

- Санитизация HTML на выходе
- Защита от XSS через DOMPurify
- Валидация упоминаний

## 4. Пример использования

```vue
<template>
  <div class="task-details">
    <h1>{{ task.title }}</h1>

    <!-- Переиспользование модуля активности -->
    <ActivityFeed
      :entity-id="task.id"
      entity-type="task"
      :team-members="projectMembers"
      :related-tasks="subtasks"
    />
  </div>
</template>

<script setup>
  import { ActivityFeed } from '@/modules/activity'

  // Модуль готов к использованию
</script>
```

# План по шагам: Модуль активностей (Activity)

## Текущее состояние (2025-03)

- ✅ Комментарии в задачах — Quill (RichTextEditor), HTML в body
- ✅ Отображение — RichContentDisplay (стили как в редакторе)
- ✅ Активность (заметки) — RichTextEditor в описании, RichContentDisplay при показе

## Этап 1: Укрепление Quill (1–2 дня)

- [x] Единый RichContentDisplay для комментариев и активности
- [x] Проверка отображения: bold, italic, списки, ссылки, blockquote, code-block, заголовки h1–h3
- [x] Обратная совместимость: старый plain text отображается корректно (normalizeContentForDisplay)

## Этап 2: Slash-команды в Quill (2–3 дня)

- [x] Расширение Quill: при вводе `/` — меню команд
- [x] Команды: заголовок, список, чеклист, код, цитата
- [x] Без смены редактора (остаёмся на Quill)

## Этап 3: Mentions @ (3–4 дня)

- [ ] При вводе `@` — меню пользователей workspace
- [ ] Вставка mention как span с data-user-id
- [ ] Отображение: @Имя в RichContentDisplay
- [ ] (Опционально) @ для задач

## Этап 4: Миграция на Tiptap (1–2 недели)

- [ ] Установка Tiptap 2.x + расширения
- [ ] ActivityEditor.vue на базе Tiptap
- [ ] Slash-command extension
- [ ] Mention extension
- [ ] Хранение: JSON (ProseMirror) или HTML
- [ ] Миграция комментариев: HTML → JSON (если выбран JSON)

## Этап 5: Кастомные блоки (2–3 недели)

- [ ] BannerExtension + BannerBlock.vue
- [ ] CalloutExtension + CalloutBlock.vue
- [ ] TaskListBlock (встроенный в Tiptap)
- [ ] TableBlock (опционально)

## Этап 6: Единый ActivityFeed (1 неделя)

- [ ] Объединение комментариев задач и заметок CRM в один поток
- [ ] Фильтры по типу (комментарий / заметка / звонок)
- [ ] Переиспользование ActivityEditor в задачах, сделках, контактах

## Этап 7: Расширения (по необходимости)

- [ ] Редактирование комментариев
- [ ] Ответ на комментарий (thread)
- [ ] Реакции (emoji)
- [ ] Вложения в комментариях
