import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'

@Injectable()
export class Base64DecodePipe implements PipeTransform {
  transform(value: unknown) {
    if (typeof value !== 'string') throw new BadRequestException('Cannot decode base64 value, string expected')
    return Buffer.from(value, 'base64').toString()
  }
}
