import { Base64DecodePipe } from './base64-decode.pipe'
import { BadRequestException } from '@nestjs/common'

describe('Base64DecodePipe', () => {
  const pipe = new Base64DecodePipe()

  it('Fails if the prop is not a string', async () => {
    expect(() => pipe.transform(1)).toThrow(BadRequestException)
  })

  it('Decodes only base64 strings', async () => {
    expect(pipe.transform('dGVzdA==')).toBe('test')
    expect(pipe.transform('dGVzdA')).toBe('dGVzdA')
  })
})
