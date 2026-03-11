export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

export const PASSWORD_ERROR =
  'Минимум 8 символов, буквы, цифры, спецсимволы'

export function validatePassword(password: string): boolean {
  return PASSWORD_REGEX.test(password)
}

export function getPasswordError(password: string): string {
  if (!password) return ''
  return validatePassword(password) ? '' : PASSWORD_ERROR
}
