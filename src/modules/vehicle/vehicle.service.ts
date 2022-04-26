import { InjectEntityManager } from '@mikro-orm/nestjs'
import { EntityManager } from '@mikro-orm/postgresql'
import { BadRequestException, Injectable } from '@nestjs/common'
import { FileUpload } from 'graphql-upload'
import path from 'path'
import { FILE_UPLOAD_FOLDERS } from '../../constants/file-upload-folders'
import { Organization } from '../organization/entities/organization.entity'
import { OrganizationRepository } from '../organization/repositories/organization.repository'
import { S3Service } from '../s3/s3.service'
import { CreateSimCardDTO } from '../sim-card/dto/crud-sim-card.dto'
import { SimCard } from '../sim-card/sim-card.entity'
import { SimCardRepository } from '../sim-card/sim-card.repository'
import { CreateTrackerDTO } from '../tracker/dto/crud-tracker.dto'
import { Tracker } from '../tracker/tracker.entity'
import { TrackerRepository } from '../tracker/tracker.repository'
import { CreateVehicleDTO, UpdateVehicleDTO } from './dtos/crud-vehicle.dto'
import { Vehicle } from './vehicle.entity'
import { VehicleRepository } from './vehicle.repository'

interface CreateVehicleArgs {
  dto: CreateVehicleDTO
  photo?: FileUpload | null
  organization: Organization
}

interface UpdateVehicleArgs {
  id: number
  dto: UpdateVehicleDTO
  newPhoto?: FileUpload | null
  userOrganization: Organization | number
}

interface SetTrackerArgs {
  vehicleId: number
  trackerIds: number[]
  userOrganization: Organization | number
}

interface InstallNewTrackerArgs {
  dto: CreateTrackerDTO
  vehicleId: number
  userOrganization: number
}

@Injectable()
export class VehicleService {
  constructor(
    readonly s3Service: S3Service,
    @InjectEntityManager('postgres')
    readonly entityManager: EntityManager,
    readonly vehicleRepository: VehicleRepository,
    readonly trackerRepository: TrackerRepository,
    readonly simCardRepository: SimCardRepository,
    readonly organizationRepository: OrganizationRepository
  ) {}

  async create({ dto, organization, photo }: CreateVehicleArgs): Promise<Vehicle> {
    const vehicle = Vehicle.create({ ...dto, organization })

    await this.vehicleRepository.assertUniquenessForColumn('plate', dto.plate)

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

    const vehicle = await this.vehicleRepository.findOne({ id, organization: userOrganization })
    if (!vehicle) throw new BadRequestException(`Vehicle: ${id} does not exist or does not belong to the request user organization.`)

    if (dto.plate && vehicle.plate !== dto.plate) {
      await this.vehicleRepository.assertUniquenessForColumn('plate', dto.plate)
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

  /**
   * Sets the trackers associated with a vehicle, if the vehicle had any associated trackers they are removed
   *
   * @throws {UnauthorizedException} if the vehicle or any of the trackers does not belong to the request
   * user organization
   *
   * ```ts
   * // before: vehicle.trackers = [{ id: 1 }, { id: 2 }, { id: 6 }]
   * setTrackers({ vehicleId: vehicle.id, trackerIds: [1, 3], organization })
   *
   * // after: vehicle.trackers = [{ id: 1 }, { id: 3 }]
   * ```
   */
  async setTrackers(args: SetTrackerArgs): Promise<Vehicle> {
    const { vehicleId, trackerIds, userOrganization } = args

    const vehicle = await this.vehicleRepository.findOneOrFail(
      { id: vehicleId, organization: userOrganization },
      { populate: ['trackers'] }
    )

    const trackers = await this.trackerRepository.find({ organization: userOrganization, id: { $in: trackerIds } })

    const invalidTrackers = trackerIds.filter(id => {
      const tracker = trackers.find(t => t.id === id)

      if (!tracker) return true

      return tracker.vehicle !== null && tracker.vehicle.id !== vehicleId
    })

    if (invalidTrackers.length > 0) {
      throw new BadRequestException(
        `Cannot set vehicleTrackers to ${trackerIds} as trackers [${invalidTrackers.join(', ')}] ` +
          `either: do not exist, do not belong to the request user organization, are already installed in a vehicle`
      )
    }

    vehicle.trackers.set(trackers)

    await this.vehicleRepository.persistAndFlush(vehicle)

    return vehicle
  }

  /**
   * Creates and installs a new tracker, containing existing or new sim cards, on a vehicle
   *
   * @throws {BadRequestException} if the vehicle must already has trackers installed
   */
  async installNewTracker(options: InstallNewTrackerArgs): Promise<void> {
    const { vehicleId, userOrganization, dto } = options
    const { identifier, model, simCards } = dto

    const organization = await this.organizationRepository.findOneOrFail({ id: userOrganization })
    const vehicle = await this.vehicleRepository.findOneOrFail({ id: vehicleId, organization: userOrganization })

    await this.trackerRepository.assertUniquenessForColumn('identifier', identifier)

    await this.entityManager.transactional(async transaction => {
      const newTracker = Tracker.create({ identifier, model, vehicle, organization })

      await transaction.persistAndFlush(newTracker)

      const simCardsToBeCreated = simCards
        .filter(simCardDtoOrId => !!simCardDtoOrId.dto)
        .map(s => SimCard.create({ ...(s.dto as CreateSimCardDTO), organization }))

      const simCardsIdsToAssociated = simCards.filter(simCardDtoOrId => !!simCardDtoOrId.id).map(s => s.id as number)

      const associateSimWithNewTrackerAndPersist = (sims: SimCard[]) => {
        sims.forEach(sim => {
          sim.tracker = newTracker
        })

        return transaction.persistAndFlush(sims)
      }

      const validateSimsToBeCreated = async () => {
        const simsWithUsedPhoneNumbers = await transaction.find(SimCard, {
          phoneNumber: { $in: simCardsToBeCreated.map(s => s.phoneNumber) }
        })

        if (simsWithUsedPhoneNumbers.length > 0) {
          throw new BadRequestException(`Sim card phone numbers: ${simsWithUsedPhoneNumbers.map(s => s.phoneNumber)} are already in use`)
        }

        const simsWithUsedSnns = await transaction.find(SimCard, {
          ssn: { $in: simCardsToBeCreated.map(s => s.ssn) }
        })

        if (simsWithUsedSnns.length > 0) {
          throw new BadRequestException(`Sim card ssns: ${simsWithUsedSnns.map(s => s.ssn)} are already in use`)
        }
      }

      if (simCardsToBeCreated.length > 0) {
        await validateSimsToBeCreated()
        await associateSimWithNewTrackerAndPersist(simCardsToBeCreated)
      }

      const validateAndGetSimsToBeAssociated = async () => {
        const existingSimsToBeAssociated = await transaction.find(
          SimCard,
          { id: simCardsIdsToAssociated, organization },
          { populate: ['tracker'] }
        )

        const existingSimsIds = existingSimsToBeAssociated.map(sim => sim.id)

        const notFoundSimsIds = simCardsIdsToAssociated.filter(id => !existingSimsIds.includes(id))

        if (notFoundSimsIds.length > 0) {
          throw new BadRequestException(
            `SimCards to be associated with the new tracker (ids ${notFoundSimsIds}) were not found and/or do not belong to the request user organization.`
          )
        }

        const simsAlreadyOnTrackerIds = existingSimsToBeAssociated.filter(sim => sim.tracker !== null).map(sim => sim.id)

        if (simsAlreadyOnTrackerIds.length > 0) {
          throw new BadRequestException(
            `SimCards to be associated with the new tracker (ids ${simsAlreadyOnTrackerIds}) are linked to another tracker.`
          )
        }

        return existingSimsToBeAssociated
      }

      if (simCardsIdsToAssociated.length > 0) {
        const existingSimsToBeAssociated = await validateAndGetSimsToBeAssociated()
        await associateSimWithNewTrackerAndPersist(existingSimsToBeAssociated)
      }
    })
  }
}
