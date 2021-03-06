import { UnregisteredUserRepository } from './repositories/unregistered-user.repository'
import { UnregisteredUser } from './entities/unregistered-user.entity'
import { RegisterUserDTO } from '../auth/dtos/register-user.dto'
import { UserRepository } from './repositories/user.repository'
import { Test, TestingModule } from '@nestjs/testing'
import { OrmModule } from '../../database/orm.module'
import { UserService } from '../user/user.service'
import { Profile } from 'passport-google-oauth20'

describe('UserService', () => {
  let unregisteredUserRepository: UnregisteredUserRepository
  let repository: UserRepository
  let service: UserService

  let urUserMock!: UnregisteredUser

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      /**
       * Since we're testing @UseRequestContext decorated methods MikroOrm
       * needs to be avaliable inside the service context, this means that
       * mikroorm will use its instances instead of nestjs provided ones,
       * hence we cant mock repositories here
       */
      imports: [OrmModule],
      providers: [UserService]
    }).compile()

    service = module.get(UserService)
    repository = module.get(UserRepository)
    unregisteredUserRepository = module.get(UnregisteredUserRepository)

    urUserMock = new UnregisteredUser({
      username: 'username',

      email: 'mockemail@gmail.com',
      emailVerified: false,

      oauthProvider: 'google',
      oauthProfileId: 'abc123'
    })
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(repository).toBeDefined()
    expect(unregisteredUserRepository).toBeDefined()
  })

  describe('[registerUser]', () => {
    let registerDto!: RegisterUserDTO

    const userMock = { id: 1 }

    beforeEach(() => {
      jest.spyOn(repository, 'findOneOrFail').mockImplementation(async () => userMock as any)

      registerDto = new RegisterUserDTO()
      registerDto.email = 'email@gmail.com'
      registerDto.username = 'username'
      registerDto.password = '$123abc'
      registerDto.refersToUnregisteredUser = 'uuidmock'
    })

    it('attempts to find the unregistered user when the user being registered refers to one', async () => {
      const urFindOne = jest.spyOn(unregisteredUserRepository, 'findOne').mockImplementationOnce(async () => null)
      const urRemove = jest.spyOn(unregisteredUserRepository, 'remove').mockImplementation()
      jest.spyOn(repository, 'persistAndFlush').mockImplementation()
      jest.spyOn(repository, 'findOneOrFail').mockImplementation()

      await service.registerUser(registerDto)

      expect(urFindOne).toHaveBeenLastCalledWith({ uuid: registerDto.refersToUnregisteredUser })
      expect(urRemove).not.toHaveBeenCalled()
    })

    it('deletes the unregistered user when the user being registered refers to a existing one', async () => {
      const urFindOne = jest.spyOn(unregisteredUserRepository, 'findOne').mockImplementationOnce(async () => urUserMock)
      const urRemove = jest.spyOn(unregisteredUserRepository, 'remove').mockImplementation()
      jest.spyOn(repository, 'persistAndFlush').mockImplementation()

      await service.registerUser(registerDto)

      expect(urFindOne).toHaveBeenLastCalledWith({ uuid: registerDto.refersToUnregisteredUser })
      expect(urRemove).toHaveBeenLastCalledWith(urUserMock)
    })
  })

  describe('[createOrFindUnregisteredUserForGoogleProfile]', () => {
    const googleProfileMock: Profile = {
      id: '10851555554193',
      displayName: 'Deltrano Guidorizzi',
      name: { familyName: 'Guidorizzi', givenName: 'Deltrano' },
      emails: [{ value: 'deltrano.guidorizzi@xd.ci', verified: 'true' }],
      photos: [
        {
          value: 'https://lh3.googleusercontent.com/a/AATXAJzMcNM26svaW2Auv4f6YnL7C7hOUZEBZgXetXw0=s96-c'
        }
      ],
      provider: 'google',
      _raw:
        '{\n' +
        '  "sub": "10851555554193",\n' +
        '  "name": "Deltrano Guidorizzi",\n' +
        '  "given_name": "Deltrano",\n' +
        '  "family_name": "Guidorizzi",\n' +
        '  "profile": "https://plus.google.com/10851555554193",\n' +
        '  "picture": "https://lh3.googleusercontent.com/a/AATXAJzMcNM26svaW2Auv4f6YnL7C7hOUZEBZgXetXw0\\u003ds96-c",\n' +
        '  "email": "deltrano.guidorizzi@xd.ci",\n' +
        '  "email_verified": true,\n' +
        '  "locale": "pt-BR",\n' +
        '  "hd": "xd.ci"\n' +
        '}',
      _json: {
        sub: '10851555554193',
        name: 'Deltrano Guidorizzi',
        given_name: 'Deltrano',
        family_name: 'Guidorizzi',
        profile: 'https://plus.google.com/10851555554193',
        picture: 'https://lh3.googleusercontent.com/a/AATXAJzMcNM26svaW2Auv4f6YnL7C7hOUZEBZgXetXw0=s96-c',
        email: 'deltrano.guidorizzi@xd.ci',
        email_verified: 'true',
        locale: 'pt-BR',
        hd: 'xd.ci'
      } as any,
      profileUrl: ''
    }

    it('returns the existing unregistered user for the profile if it exists', async () => {
      const urFindOne = jest.spyOn(unregisteredUserRepository, 'findOne').mockImplementationOnce(async () => urUserMock)

      const urUser = await service.createOrFindUnregisteredUserForGoogleProfile(googleProfileMock)

      expect(urFindOne).toHaveBeenLastCalledWith({ oauthProvider: 'google', oauthProfileId: googleProfileMock.id })
      expect(urUser).toBe(urUserMock)
    })

    it('creates a unregistered user for the profile if doest have one', async () => {
      jest.spyOn(unregisteredUserRepository, 'findOne').mockImplementationOnce(async () => null)
      jest.spyOn(unregisteredUserRepository, 'persistAndFlush').mockImplementationOnce(async () => {})

      const urUser = await service.createOrFindUnregisteredUserForGoogleProfile(googleProfileMock)

      expect(urUser).toBeInstanceOf(UnregisteredUser)
      expect(urUser.email).toBe(googleProfileMock.emails?.[0].value ?? null)
      expect(typeof urUser.emailVerified).toBe('boolean')
    })
  })
})
