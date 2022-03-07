import { InternalServerErrorException } from '@nestjs/common'
import { readFileSync } from 'fs'
import { compile } from 'handlebars'

/**
 * @throws {InternalServerErrorException} if the file does not exist
 */
export function parseHandlebarsTemplate(templateFilePath: string, replacements?: Record<string, unknown>): string {
  let file!: string

  try {
    file = readFileSync(templateFilePath, 'utf-8')
  } catch {
    throw new InternalServerErrorException('Cannot send email, template not found')
  }

  const fileString = file.toString()
  const createHtmlFile = compile(fileString)
  return createHtmlFile(replacements)
}

/**
 * Creates a query point to the PWA using the PWA_BASE_URL env var
 *
 * @example
 *
 * ```ts
 * // http://base-site-url/#/fancy-route?page=12&showActive=false
 * createFrontEndUrl('fancy-route', { page: '12', showActive: 'false' })
 * ```
 */
export function createPwaUrl(route?: string, queryParams?: Record<string, string>): string {
  let url = `${process.env.PWA_BASE_URL}/#/${route ?? ''}`

  if (queryParams) {
    const query = new URLSearchParams(queryParams)
    url = `${url}?${query}`
  }

  return url
}
