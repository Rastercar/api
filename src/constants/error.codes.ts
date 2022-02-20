export const ERROR_CODES = {
  /**
   * Indicates a email address is in use and cannot be used to create/update a existing user/org email
   */
  EMAIL_IN_USE: 'EMAIL_IN_USE',
  /**
   * The provided old password required to change the current password is invalid
   */
  OLD_PASSWORD_INVALID: 'OLD_PASSWORD_INVALID'
} as const
