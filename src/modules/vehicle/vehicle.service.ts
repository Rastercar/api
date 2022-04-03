import { UniqueViolationException } from '../../errors/unique-violation.exception'
import { CreateVehicleDTO, UpdateVehicleDTO } from './dtos/crud-vehicle.dto'
import { Organization } from '../organization/entities/organization.entity'
import { FILE_UPLOAD_FOLDERS } from '../../constants/file-upload-folders'
import { BadRequestException, Injectable } from '@nestjs/common'
import { VehicleRepository } from './vehicle.repository'
import { S3Service } from '../s3/s3.service'
import { FileUpload } from 'graphql-upload'
import { Vehicle } from './vehicle.entity'
import path from 'path'

interface CreateVehicleArgs {
  dto: CreateVehicleDTO
  photo?: FileUpload | null
  organization: Organization
}
interface UpdateVehicleArgs {
  id: number
  dto: UpdateVehicleDTO
  newPhoto?: FileUpload | null
  userOrganization: Organization
}

@Injectable()
export class VehicleService {
  constructor(readonly vehicleRepository: VehicleRepository, readonly s3Service: S3Service) {}

  /**
   * @throws {UniqueViolationException} If the vehicle plate is not unique for the organization
   */
  private async assertVehiclePlateIsUniqueForOrg(args: { plate: string; organization: Organization }) {
    const { plate, organization } = args

    const vehicleWithPlate = await this.vehicleRepository.findOne({ plate, organization })
    if (vehicleWithPlate !== null) throw new UniqueViolationException('plate')
  }

  async create(args: CreateVehicleArgs): Promise<Vehicle> {
    const { dto, organization, photo } = args

    const vehicle = new Vehicle(dto)
    vehicle.organization = organization

    await this.assertVehiclePlateIsUniqueForOrg({ plate: dto.plate, organization })

    if (photo) {
      const { Key } = await this.s3Service.upload({
        folderPath: FILE_UPLOAD_FOLDERS.VEHICLE_PICTURES,
        mimetype: photo.mimetype,
        bufferOrStream: photo.createReadStream,
        fileExtension: path.extname(photo.filename)
      })

      vehicle.photo = Key
    }

    await this.vehicleRepository.persistAndFlush(vehicle).catch(async error => {
      if (vehicle.photo) await this.s3Service.delete(vehicle.photo)
      throw error
    })

    return vehicle
  }

  async update(args: UpdateVehicleArgs): Promise<Vehicle> {
    const { dto, id, userOrganization, newPhoto } = args

    const vehicle = await this.vehicleRepository.findOne({ plate: dto.plate, organization: userOrganization })
    if (!vehicle) throw new BadRequestException(`Vehicle: ${id} does not exist or does not belong to the request user organization.`)

    if (dto.plate && vehicle.plate !== dto.plate) {
      await this.assertVehiclePlateIsUniqueForOrg({ plate: dto.plate, organization: userOrganization })
    }

    const oldPhotoS3Key = vehicle.photo

    if (dto.removePhoto) vehicle.photo = null

    if (newPhoto) {
      const { Key } = await this.s3Service.upload({
        folderPath: FILE_UPLOAD_FOLDERS.VEHICLE_PICTURES,
        mimetype: newPhoto.mimetype,
        bufferOrStream: newPhoto.createReadStream,
        fileExtension: path.extname(newPhoto.filename)
      })

      vehicle.photo = Key
    }

    Object.keys(dto).forEach(f => {
      const field = f as unknown as keyof typeof dto
      if (dto[field] !== undefined) vehicle[field] = dto[field]
    })

    const vehicleHadOldPhoto = typeof oldPhotoS3Key === 'string' && !!oldPhotoS3Key
    const vehicleHasNewPhoto = typeof vehicle.photo === 'string' && !!vehicle.photo

    await this.vehicleRepository
      .persistAndFlush(vehicle)
      .then(async () => {
        const photoWasReplaced = vehicleHadOldPhoto && vehicleHasNewPhoto && oldPhotoS3Key !== vehicle.photo
        const photoWasDeleted = vehicleHadOldPhoto && vehicle.photo === null

        // If the vehicle was successfully persisted delete its old photo and ignore any errors,
        // we dont care if the deletion fails because it would just leave the old photo on the s3
        // bucket this should not be of any concern to the current request
        if (photoWasReplaced || photoWasDeleted) await this.s3Service.delete(oldPhotoS3Key).catch(() => null)
      })
      .catch(async error => {
        // If we failed to update the vehicle, remove the new photo as its would not be stored in the DB
        if (vehicleHasNewPhoto) await this.s3Service.delete(vehicle.photo as string).catch(() => null)
        throw error
      })

    return vehicle
  }
}
