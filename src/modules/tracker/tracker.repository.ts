import { BaseRepository } from '../../database/postgres/base/base-repository'
import { Tracker } from './tracker.entity'

export class TrackerRepository extends BaseRepository<Tracker> {
  allActiveTrackersForOrganization(organizationId: number) {
    return this.qb('tracker')
      .select('*')
      .joinAndSelect('tracker.simCards', 'cards')
      .where({ 'tracker.organization_id': organizationId })
      .getResultList()
  }
}
