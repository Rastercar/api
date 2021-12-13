import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { Jwt } from './strategies/jwt.strategy'
import { User } from '../user/user.entity'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService, private readonly userService: UserService) {}

  /**
   * @throws {NotFoundException} If there is no user with the informed username
   * @throws {UnauthorizedException} If the password is invalid
   */
  async validateUserByCredentials(credentials: { email: string; password: string }): Promise<User> {
    const { email, password } = credentials

    const user = await this.userService.userRepository.findOneOrFail({ email })

    const passwordIsValid = await bcrypt.compare(password, user.password as string)
    if (!passwordIsValid) throw new UnauthorizedException('Invalid password')

    delete user.password

    return user
  }

  /**
   * Fetches user data and generates a JWT for a given user
   */
  async login(user: User): Promise<{ user: User; token: Jwt }> {
    const token = { type: 'bearer', value: this.jwtService.sign({ sub: user.id }) }
    return { user, token }
  }
}
