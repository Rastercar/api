/**
 * String literal of tracker models suported by the plataform
 */
export type trackerModel = 'ST310U'

interface TrackerDescription {
  /**
   * The amount of sim card slots for the tracker model, limits
   * how many sim cards can be associated with the tracker
   */
  simCardSlots: number
}

export const HOMOLOGATED_TRACKER: Record<trackerModel, TrackerDescription> = {
  /**
   * https://www.sastracker.com.br/manuais/ST310U_Manual_do_Usuario_Rev.1.1.pdf
   */
  ST310U: {
    simCardSlots: 1
  }
} as const
