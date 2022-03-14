import { UniqueViolationException } from '../../errors/unique-violation.exception'
import { Organization } from '../organization/entities/organization.entity'
import { FILE_UPLOAD_FOLDERS } from '../../constants/file-upload-folders'
import { CreateVehicleDTO } from './dtos/create-vehicle.dto'
import { VehicleRepository } from './vehicle.repository'
import { S3Service } from '../s3/s3.service'
import { Injectable } from '@nestjs/common'
import { FileUpload } from 'graphql-upload'
import { Vehicle } from './vehicle.entity'
import * as path from 'path'

@Injectable()
export class VehicleService {
  constructor(readonly vehicleRepository: VehicleRepository, readonly s3Service: S3Service) {}

  async create(dto: CreateVehicleDTO, organization: Organization, photo?: FileUpload | null): Promise<Vehicle> {
    const vehicle = new Vehicle(dto)
    vehicle.organization = organization

    const vehicleWithPlate = await this.vehicleRepository.findOne({ plate: dto.plate, organization })
    if (vehicleWithPlate !== null) throw new UniqueViolationException('plate')

    if (photo) {
      const { Key } = await this.s3Service.upload({
        folderPath: FILE_UPLOAD_FOLDERS.VEHICLE_PICTURES,
        mimetype: photo.mimetype,
        bufferOrStream: photo.createReadStream,
        fileExtension: path.extname(photo.filename)
      })

      vehicle.photo = Key
    }

    await this.vehicleRepository.persistAndFlush(vehicle)

    return vehicle
  }
}
