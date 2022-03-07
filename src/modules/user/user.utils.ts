import { master_user, user } from '@prisma/client'

export const isMasterUser = (u: user | master_user): u is master_user => {
  const mu = u as master_user
  return !!mu.master_access_level_id || !mu.access_level_id
}
