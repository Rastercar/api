import { createPwaUrl, parseHandlebarsTemplate } from './mailer.utils'
import { InternalServerErrorException } from '@nestjs/common'
import * as fs from 'fs'

describe('[createPwaUrl]', () => {
  const baseUrl = process.env.PWA_BASE_URL

  it('Creates the url using the PWA_BASE_URL env var', () => {
    expect(createPwaUrl()).toBe(`${baseUrl}/#/`)
    expect(createPwaUrl('help')).toBe(`${baseUrl}/#/help`)
    expect(createPwaUrl(`nested/route`)).toBe(`${baseUrl}/#/nested/route`)
  })

  it('Creates the query strings', () => {
    expect(createPwaUrl('help', { page: '10' })).toBe(`${baseUrl}/#/help?page=10`)
    expect(createPwaUrl('help', { page: '10', showActive: 'false' })).toBe(`${baseUrl}/#/help?page=10&showActive=false`)
  })
})

describe('[parseHandlebarsTemplate]', () => {
  jest.mock('handlebars')
  jest.mock('path')

  it('Throws InternalServerErrorException if the template does not exist', () => {
    jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
      throw new Error()
    })

    let error!: InternalServerErrorException

    const templateFile = 'template-file.hbs'

    try {
      parseHandlebarsTemplate(templateFile)
    } catch (err) {
      error = err as InternalServerErrorException
    }

    expect(error).toBeInstanceOf(InternalServerErrorException)
    expect(fs.readFileSync).toHaveBeenLastCalledWith(templateFile, expect.anything())
  })
})
