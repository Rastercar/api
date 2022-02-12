import { MASTER_PERMISSION, PERMISSION } from '../../modules/auth/constants/permissions'
import { Migration } from '@mikro-orm/migrations'
import * as bcrypt from 'bcrypt'

/**
 * Creates the root master user and his root access level and master access level
 *
 * disclaimer: this needs to be a migration instead of a seeder because we need to
 * be sure this is run whenever and migrations are automatically run on deployment
 */
export class CreateRootMasterUser extends Migration {
  async up(): Promise<void> {
    const knex = this.getKnex()

    const CREATE_MASTER_ACCESS_LEVEL = knex
      .insert({
        created_at: knex.raw('now()'),
        name: 'Acesso painel geral completo',
        description: 'contém todas as permissões do painel geral',
        is_fixed: true,
        permissions: Object.values(MASTER_PERMISSION)
      })
      .into('master_access_level')
      .returning('id')
      .toQuery()

    const CREATE_ACCESS_LEVEL = knex
      .insert({
        created_at: knex.raw('now()'),
        name: 'Acesso painel do rastreado completo',
        description: 'contém todas as permissões do painel do rastreado',
        is_fixed: true,
        permissions: Object.values(PERMISSION),
        organization_id: null
      })
      .into('access_level')
      .returning('id')
      .toQuery()

    const [{ id: master_access_level_id }] = await this.execute(CREATE_MASTER_ACCESS_LEVEL)

    const [{ id: access_level_id }] = await this.execute(CREATE_ACCESS_LEVEL)

    const CREATE_MASTER_USER = knex
      .insert({
        created_at: knex.raw('now()'),
        username: 'Usuário Master',
        email: 'usuario.master@gmail.com',
        email_verified: false,
        password: bcrypt.hashSync('master', 10),
        access_level_id,
        master_access_level_id
      })
      .into('master_user')
      .toQuery()

    await this.execute(CREATE_MASTER_USER)
  }
}
