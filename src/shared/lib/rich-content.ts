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
