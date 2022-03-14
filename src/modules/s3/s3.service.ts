import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { v4 as uuid } from 'uuid'
import { ReadStream } from 'fs'
import { S3 } from 'aws-sdk'
import { FILE_UPLOAD_FOLDERS } from '../../constants/file-upload-folders'

interface UploadArgs {
  bufferOrStream: Buffer | (() => ReadStream)
  mimetype: string
  fileExtension: string
  /**
   * A forward slash ending folder path, ex: `users/profile-pictures/`
   *
   * @see https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-folders.html
   */
  folderPath?: FILE_UPLOAD_FOLDERS
}

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

  upload(options: UploadArgs): Promise<S3.ManagedUpload.SendData> {
    const { bufferOrStream, fileExtension, mimetype, folderPath } = options

    return this.s3
      .upload({
        Key: `${folderPath ?? ''}${uuid()}-${fileExtension}`,
        Body: Buffer.isBuffer(bufferOrStream) ? bufferOrStream : bufferOrStream(),
        Bucket: this.bucketName,
        ContentType: mimetype
      })
      .promise()
  }

  delete(key: string) {
    return this.s3.deleteObject({ Bucket: this.bucketName, Key: key }).promise()
  }
}
