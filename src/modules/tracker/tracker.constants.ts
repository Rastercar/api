/**
 * String literal of tracker models suported by the plataform
 */
export type trackerModel = 'GT06'

interface TrackerDescription {
  /**
   * The amount of sim card slots for the tracker model, limits
   * how many sim cards can be associated with the tracker
   */
  simCardSlots: number
}

export const HOMOLOGATED_TRACKER: Record<trackerModel, TrackerDescription> = {
  GT06: {
    simCardSlots: 1
  }
} as const
