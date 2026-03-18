<template>
  <div class="CommentCard" :class="{ 'CommentCard--reply': !isRoot }">
    <div class="CommentCard__Inner">
      <div class="CommentCard__Header">
        <div class="CommentCard__Author">
          <div class="CommentCard__Avatar" :class="{ 'CommentCard__Avatar--sm': !isRoot }">
            {{ ctx.getInitials(comment.createdBy) }}
          </div>
          <div class="CommentCard__Meta">
            <span class="CommentCard__Name">{{ ctx.getCreatorName(comment.createdBy) }}</span>
            <span class="CommentCard__Time">{{ ctx.formatRelativeTime(comment.createdAt) }}</span>
          </div>
        </div>
        <div v-if="ctx.canDeleteComment(comment)" class="CommentCard__Menu">
          <button
            type="button"
            class="CommentCard__MenuBtn"
            aria-label="Ещё"
            @click="ctx.toggleCommentMenu(comment.id)"
          >
            <EllipsisVerticalIcon size="sm" />
          </button>
          <div v-if="commentMenuOpenVal === comment.id" class="CommentCard__DropdownWrap">
            <div class="CommentCard__Dropdown">
              <button
                v-if="ctx.canEditTask"
                type="button"
                class="CommentCard__DropdownItem"
                @click="
                  ctx.startEditComment(comment)
                  ctx.toggleCommentMenu(comment.id)
                "
              >
                Редактировать
              </button>
              <button
                type="button"
                class="CommentCard__DropdownItem CommentCard__DropdownItem--danger"
                @click="
                  ctx.deleteComment(comment)
                  ctx.toggleCommentMenu(comment.id)
                "
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="editingCommentIdVal !== comment.id" class="CommentCard__Content">
        <RichContentDisplay :content="comment.body" />
      </div>
      <div v-else class="CommentCard__Edit">
        <RichTextEditor
          :model-value="editCommentBodyVal"
          placeholder="Редактировать..."
          compact
          class="mb-(--spacing-2)"
          @update:model-value="ctx.setEditCommentBody($event)"
        />
        <div class="flex gap-(--spacing-2)">
          <Button
            size="sm"
            variant="primary"
            :disabled="ctx.isCommentEmpty(editCommentBodyVal) || commentSavingVal"
            @click="ctx.saveEditComment(comment)"
          >
            Сохранить
          </Button>
          <Button size="sm" variant="ghost" @click="ctx.cancelEditComment"> Отмена </Button>
        </div>
      </div>
      <div class="CommentCard__Footer">
        <Tooltip text="Просмотрено" trigger="hover" placement="top">
          <span class="CommentCard__Seen">
            <ThumbsUpIcon size="xs" />
            <span class="CommentCard__SeenText">Просмотрено</span>
          </span>
        </Tooltip>
        <button
          type="button"
          class="CommentCard__ReplyBtn"
          @click="ctx.toggleReplyForm(comment.id)"
        >
          <ReplyIcon size="xs" />
          <span>Ответить</span>
        </button>
      </div>
    </div>

    <!-- Вложенные ответы (рекурсия) -->
    <div v-if="replies.length" class="CommentCard__RepliesBlock">
      <button
        v-if="!ctx.isRepliesExpanded(comment.id)"
        type="button"
        class="CommentCard__ShowReplies"
        @click="ctx.expandReplies(comment.id)"
      >
        Показать {{ replies.length }} {{ ctx.replyCountLabel(replies.length) }}
      </button>
      <template v-else>
        <button
          type="button"
          class="CommentCard__HideReplies"
          @click="ctx.collapseReplies(comment.id)"
        >
          Скрыть ответы
        </button>
        <div class="CommentCard__Replies">
          <CommentThread v-for="r in visibleReplies" :key="r.id" :comment="r" :is-root="false" />
        </div>
        <button
          v-if="ctx.hasMoreReplies(comment.id)"
          type="button"
          class="CommentCard__ShowReplies"
          @click="ctx.showMoreReplies(comment.id)"
        >
          Показать ещё {{ replies.length - ctx.getVisibleRepliesCount(comment.id) }}
          {{ ctx.replyCountLabel(replies.length - ctx.getVisibleRepliesCount(comment.id)) }}
        </button>
      </template>
    </div>

    <!-- Форма ответа -->
    <div v-if="replyToCommentIdVal === comment.id" class="CommentCard__ReplyForm">
      <RichTextEditor
        :model-value="replyCommentBodyVal"
        placeholder="Написать ответ..."
        compact
        class="mb-(--spacing-2)"
        @update:model-value="ctx.setReplyCommentBody($event)"
      />
      <div class="flex gap-(--spacing-2)">
        <Button
          size="sm"
          variant="primary"
          :disabled="ctx.isCommentEmpty(replyCommentBodyVal) || commentSavingVal"
          @click="ctx.addReply(comment)"
        >
          {{ commentSavingVal ? 'Отправка...' : 'Отправить' }}
        </Button>
        <Button size="sm" variant="ghost" @click="ctx.toggleReplyForm(comment.id)"> Отмена </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Ref } from 'vue'
  import { inject, computed } from 'vue'
  import { Button, RichTextEditor, RichContentDisplay, Tooltip } from '@/shared/ui'
  import { EllipsisVerticalIcon, ThumbsUpIcon, ReplyIcon } from '@/shared/ui/icon'
  import type { TaskComment } from '@/entities/task'

  const props = defineProps<{
    comment: TaskComment
    isRoot: boolean
  }>()

  const ctx = inject<import('./comment-context').CommentContext>('commentContext')!

  const replies = computed(() => ctx.getReplies(props.comment.id))
  const visibleReplies = computed(() => ctx.getVisibleReplies(props.comment.id))

  const commentMenuOpenVal = computed(() => (ctx.commentMenuOpen as Ref<string | null>).value)
  const editingCommentIdVal = computed(() => (ctx.editingCommentId as Ref<string | null>).value)
  const editCommentBodyVal = computed(() => (ctx.editCommentBody as Ref<string>).value)
  const replyToCommentIdVal = computed(() => (ctx.replyToCommentId as Ref<string | null>).value)
  const replyCommentBodyVal = computed(() => (ctx.replyCommentBody as Ref<string>).value)
  const commentSavingVal = computed(() => (ctx.commentSaving as Ref<boolean>).value)
</script>

<style scoped>
  .CommentCard {
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    padding: var(--spacing-3);
    background: var(--color-bg-secondary);
  }

  .CommentCard--reply {
    margin-left: var(--spacing-6);
    border-left: 2px solid var(--color-primary-default);
  }

  .CommentCard__Inner {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
  }

  .CommentCard__Header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-2);
  }

  .CommentCard__Author {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    min-w: 0;
  }

  .CommentCard__Avatar {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--color-bg-tertiary);
    color: var(--color-text-secondary);
    font-size: var(--text-xs);
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .CommentCard__Avatar--sm {
    width: 24px;
    height: 24px;
    font-size: 10px;
  }

  .CommentCard__Meta {
    display: flex;
    flex-direction: column;
    gap: 0;
    min-w: 0;
  }

  .CommentCard__Name {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .CommentCard__Time {
    font-size: 11px;
    color: var(--color-text-muted);
  }

  .CommentCard__Menu {
    position: relative;
    flex-shrink: 0;
  }

  .CommentCard__MenuBtn {
    padding: var(--spacing-1);
    border: none;
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    border-radius: var(--radius-sm);
  }

  .CommentCard__MenuBtn:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-tertiary);
  }

  .CommentCard__DropdownWrap {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: var(--spacing-1);
    z-index: 10;
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    min-width: 140px;
  }

  .CommentCard__Dropdown {
    padding: var(--spacing-1);
  }

  .CommentCard__DropdownItem {
    display: block;
    width: 100%;
    padding: var(--spacing-2) var(--spacing-3);
    text-align: left;
    font-size: var(--text-xs);
    color: var(--color-text-primary);
    background: none;
    border: none;
    cursor: pointer;
    border-radius: var(--radius-sm);
  }

  .CommentCard__DropdownItem:hover {
    background: var(--color-bg-tertiary);
  }

  .CommentCard__DropdownItem--danger:hover {
    color: var(--color-error-default);
    background: var(--color-error-light);
  }

  .CommentCard__Content {
    font-size: var(--text-xs);
    line-height: 1.45;
    color: var(--color-text-primary);
  }

  .CommentCard__Content :deep(p) {
    margin: 0 0 0.25em;
  }

  .CommentCard__Content :deep(p:last-child) {
    margin-bottom: 0;
  }

  .CommentCard__Footer {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    padding-top: var(--spacing-1);
  }

  .CommentCard__Seen {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-1);
    font-size: 11px;
    color: var(--color-text-muted);
  }

  .CommentCard__SeenText {
    font-size: 11px;
  }

  .CommentCard__ReplyBtn {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-1);
    font-size: 11px;
    color: var(--color-text-muted);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .CommentCard__ReplyBtn:hover {
    color: var(--color-primary-default);
  }

  .CommentCard__RepliesBlock {
    margin-top: var(--spacing-2);
  }

  .CommentCard__ShowReplies,
  .CommentCard__HideReplies {
    font-size: var(--text-xs);
    color: var(--color-primary-default);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .CommentCard__ShowReplies:hover,
  .CommentCard__HideReplies:hover {
    text-decoration: underline;
  }

  .CommentCard__HideReplies {
    color: var(--color-text-muted);
    margin-bottom: var(--spacing-2);
  }

  .CommentCard__Replies {
    margin-top: var(--spacing-2);
    padding-left: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
  }

  .CommentCard__ReplyForm {
    margin-top: var(--spacing-2);
    padding-top: var(--spacing-2);
    border-top: 1px solid var(--color-border-light);
  }

  .CommentCard__Edit {
    font-size: var(--text-xs);
  }
</style>
