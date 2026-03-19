/**
 * Модуль slash-команд для Quill.
 * При вводе "/" показывает меню: заголовок, список, чеклист, код.
 */
import type Quill from 'quill'

export interface SlashCommandItem {
  id: string
  label: string
  icon: string
  handler: (quill: Quill, range: { index: number; length: number }) => void
}

const SOURCE_USER = 'user' as const

const DEFAULT_COMMANDS: SlashCommandItem[] = [
  {
    id: 'h1',
    label: 'Заголовок 1',
    icon: 'H1',
    handler: (quill, range) => {
      quill.deleteText(range.index, range.length)
      const lineStart = getLineStart(quill, range.index)
      const lineLen = Math.max(1, getLineLength(quill, range.index))
      quill.formatLine(lineStart, lineLen, 'header', 1, SOURCE_USER)
      quill.setSelection(range.index + 1)
    },
  },
  {
    id: 'h2',
    label: 'Заголовок 2',
    icon: 'H2',
    handler: (quill, range) => {
      quill.deleteText(range.index, range.length)
      const lineStart = getLineStart(quill, range.index)
      const lineLen = Math.max(1, getLineLength(quill, range.index))
      quill.formatLine(lineStart, lineLen, 'header', 2, SOURCE_USER)
      quill.setSelection(range.index + 1)
    },
  },
  {
    id: 'h3',
    label: 'Заголовок 3',
    icon: 'H3',
    handler: (quill, range) => {
      quill.deleteText(range.index, range.length)
      const lineStart = getLineStart(quill, range.index)
      const lineLen = Math.max(1, getLineLength(quill, range.index))
      quill.formatLine(lineStart, lineLen, 'header', 3, SOURCE_USER)
      quill.setSelection(range.index + 1)
    },
  },
  {
    id: 'bullet',
    label: 'Маркированный список',
    icon: '•',
    handler: (quill, range) => {
      quill.deleteText(range.index, range.length)
      quill.formatLine(range.index, 0, 'list', 'bullet', SOURCE_USER)
      quill.setSelection(range.index + 1)
    },
  },
  {
    id: 'ordered',
    label: 'Нумерованный список',
    icon: '1.',
    handler: (quill, range) => {
      quill.deleteText(range.index, range.length)
      quill.formatLine(range.index, 0, 'list', 'ordered', SOURCE_USER)
      quill.setSelection(range.index + 1)
    },
  },
  {
    id: 'code',
    label: 'Блок кода',
    icon: '</>',
    handler: (quill, range) => {
      quill.deleteText(range.index, range.length)
      quill.formatLine(range.index, 0, 'code-block', true, SOURCE_USER)
      quill.setSelection(range.index + 1)
    },
  },
  {
    id: 'quote',
    label: 'Цитата',
    icon: '"',
    handler: (quill, range) => {
      quill.deleteText(range.index, range.length)
      quill.formatLine(range.index, 0, 'blockquote', true, SOURCE_USER)
      quill.setSelection(range.index + 1)
    },
  },
]

function getLineStart(quill: Quill, index: number): number {
  const text = quill.getText(0, index)
  const lastNewline = text.lastIndexOf('\n')
  return lastNewline === -1 ? 0 : lastNewline + 1
}

function getLineLength(quill: Quill, index: number): number {
  const text = quill.getText()
  const start = getLineStart(quill, index)
  const rest = text.substring(start)
  const nl = rest.indexOf('\n')
  return nl === -1 ? rest.length : nl + 1
}

function getLineContentBeforeCursor(quill: Quill, index: number): string {
  const lineStart = getLineStart(quill, index)
  return quill.getText(lineStart, index - lineStart)
}

export class SlashCommandsModule {
  quill: Quill
  options: { commands?: SlashCommandItem[] }
  menuEl: HTMLElement | null = null
  selectedIndex = 0
  range: { index: number; length: number } | null = null
  boundHandleKeydown: (e: KeyboardEvent) => void
  boundHandleClickOutside: (e: MouseEvent) => void

  constructor(quill: Quill, options: { commands?: SlashCommandItem[] } = {}) {
    this.quill = quill
    this.options = options
    this.boundHandleKeydown = this.handleKeydown.bind(this)
    this.boundHandleClickOutside = this.handleClickOutside.bind(this)
    this.quill.on('text-change', this.onTextChange.bind(this))
  }

  get commands(): SlashCommandItem[] {
    return this.options.commands ?? DEFAULT_COMMANDS
  }

  onTextChange(_delta: unknown, _oldContents: unknown, source: string) {
    if (source !== 'user') return
    const range = this.quill.getSelection()
    if (!range) return
    const lineContent = getLineContentBeforeCursor(this.quill, range.index)
    if (lineContent === '/') {
      this.show(range)
    } else if (this.menuEl && !lineContent.startsWith('/')) {
      this.hide()
    }
  }

  show(range: { index: number; length: number }) {
    // "/" is at index-1, cursor after it
    this.range = { index: range.index - 1, length: 1 }
    this.selectedIndex = 0
    if (!this.menuEl) {
      this.createMenu()
    }
    this.renderMenu()
    this.positionMenu()
    this.menuEl!.classList.remove('ql-slash-menu--hidden')
    document.addEventListener('keydown', this.boundHandleKeydown, true)
    document.addEventListener('mousedown', this.boundHandleClickOutside, true)
  }

  hide() {
    if (this.menuEl) {
      this.menuEl.classList.add('ql-slash-menu--hidden')
    }
    this.range = null
    document.removeEventListener('keydown', this.boundHandleKeydown, true)
    document.removeEventListener('mousedown', this.boundHandleClickOutside, true)
  }

  createMenu() {
    this.menuEl = document.createElement('div')
    this.menuEl.className = 'ql-slash-menu ql-slash-menu--hidden'
    this.menuEl.setAttribute('role', 'listbox')
    const container = this.quill.root.closest('.ql-container') ?? this.quill.root.parentElement
    if (container) {
      ;(container as HTMLElement).style.position = 'relative'
      container.appendChild(this.menuEl)
    }
  }

  renderMenu() {
    if (!this.menuEl) return
    this.menuEl.innerHTML = ''
    this.commands.forEach((cmd, i) => {
      const item = document.createElement('div')
      item.className = 'ql-slash-menu__item'
      if (i === this.selectedIndex) item.classList.add('ql-slash-menu__item--selected')
      item.setAttribute('role', 'option')
      item.innerHTML = `<span class="ql-slash-menu__icon">${cmd.icon}</span><span>${cmd.label}</span>`
      item.addEventListener('click', () => this.select(i))
      this.menuEl!.appendChild(item)
    })
  }

  positionMenu() {
    if (!this.menuEl || !this.range) return
    const bounds = this.quill.getBounds(this.range.index)
    if (!bounds) return
    this.menuEl.style.top = `${bounds.bottom + 4}px`
    this.menuEl.style.left = `${bounds.left}px`
  }

  select(index: number) {
    const cmd = this.commands[index]
    if (cmd && this.range) {
      cmd.handler(this.quill, this.range)
      this.hide()
    }
  }

  handleKeydown(e: KeyboardEvent) {
    if (!this.menuEl || this.menuEl.classList.contains('ql-slash-menu--hidden')) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      this.selectedIndex = (this.selectedIndex + 1) % this.commands.length
      this.renderMenu()
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      this.selectedIndex = (this.selectedIndex - 1 + this.commands.length) % this.commands.length
      this.renderMenu()
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      this.select(this.selectedIndex)
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      this.hide()
    }
  }

  handleClickOutside(e: MouseEvent) {
    if (this.menuEl && !this.menuEl.contains(e.target as Node)) {
      this.hide()
    }
  }
}
