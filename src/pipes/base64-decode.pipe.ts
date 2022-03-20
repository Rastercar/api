import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'

@Injectable()
export class Base64DecodePipe implements PipeTransform {
  transform(value: unknown) {
    if (typeof value !== 'string') throw new BadRequestException('Cannot decode base64 value, string expected')

    const isMostLikelyBase64Encoded = new RegExp('^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$').test(value)
    return isMostLikelyBase64Encoded ? Buffer.from(value, 'base64').toString() : value
  }
}
