/**
 * Проверяет, пустой ли HTML-контент (после удаления тегов и &nbsp;).
 * Используется для RichTextEditor (Quill) и подобных.
 */
export function isRichContentEmpty(html: string): boolean {
  if (!html?.trim()) return true
  const stripped = html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
  return !stripped
}

/**
 * Нормализует контент для отображения в RichContentDisplay.
 * - Plain text (без HTML): конвертирует \n в <br> для сохранения переносов строк.
 * - HTML: возвращает как есть.
 */
export function normalizeContentForDisplay(content: string): string {
  if (!content?.trim()) return ''
  // Plain text: нет тегов — сохраняем переносы строк
  if (!content.includes('<')) {
    return content.replace(/\n/g, '<br>')
  }
  return content
}
