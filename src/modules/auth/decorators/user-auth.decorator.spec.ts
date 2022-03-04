import { userAuthFactory, UserAuth } from './user-auth.decorator'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { Controller, Get } from '@nestjs/common'

@Controller()
class DummyController {
  @UserAuth()
  @Get('dummy')
  targetRoute() {
    return null
  }
}

describe('@UserAuth Decorator', () => {
  it('Applies given decorators', () => {
    const decorators = userAuthFactory()
    expect(decorators.length).toBe(1)
  })

  it('Applies the JwtAuthGuard', async () => {
    const guards = Reflect.getMetadata('__guards__', DummyController.prototype.targetRoute)
    const guard = new guards[0]()

    expect(guard).toBeInstanceOf(JwtAuthGuard)
  })
})
