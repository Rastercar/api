import { getDefinedEnviromentFileSlugs } from './validation.schema'
import * as fs from 'fs'

describe('[getDefinedEnviromentFileSlugs]', () => {
  const originalEnvFileNames = fs.readdirSync('env').filter(name => !name.includes('example'))
  const slugs = getDefinedEnviromentFileSlugs()

  it('get all slugs from the filenames in the env folder', () => {
    const slugIsInEnvFiles = (slug: string) => originalEnvFileNames.findIndex(originalEnvFile => originalEnvFile.includes(slug)) !== -1
    expect(slugs.every(slugIsInEnvFiles)).toBe(true)
  })

  it('removes the .env suffix from the slug', () => {
    const slugDoesNotContainDotEnv = (slug: string) => !slug.includes('.env')
    expect(slugs.every(slugDoesNotContainDotEnv)).toBe(true)
  })

  it('removes the example.env from the slugs list', () => {
    expect(slugs.indexOf('example')).toBe(-1)
  })
})
