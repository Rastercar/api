import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { v4 as uuid } from 'uuid'
import { S3 } from 'aws-sdk'

@Injectable()
export class S3Service {
  constructor(readonly configService: ConfigService) {
    const bucketName = configService.get<string>('AWS_UPLOADS_BUCKET_NAME')
    if (!bucketName) throw new Error('Cant insantiate S3 Service, no bucket name avaliable')
    this.bucketName = bucketName
  }

  private bucketName!: string
  private s3 = new S3()

  getObject(key: string): Promise<S3.Body> {
    return new Promise((resolve, reject) => {
      this.s3.getObject({ Bucket: this.bucketName, Key: key }, (error, { Body }) => {
        if (error || !Body) reject(new InternalServerErrorException('Error getting s3 object'))
        else resolve(Body)
      })
    })
  }

  upload(dataBuffer: Buffer, filename: string): Promise<S3.ManagedUpload.SendData> {
    return this.s3.upload({ Bucket: this.bucketName, Body: dataBuffer, Key: `${uuid()}-${filename}` }).promise()
  }

  delete(key: string) {
    return this.s3.deleteObject({ Bucket: this.bucketName, Key: key }).promise()
  }
}
