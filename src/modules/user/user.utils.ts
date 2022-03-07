import { MasterUser, User } from '@prisma/client'

export const isMasterUser = (u: User | MasterUser): u is MasterUser => {
  const mu = u as MasterUser
  return !!mu.masterAccessLevelId || !mu.accessLevelId
}
