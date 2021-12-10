import { userAuthFactory } from './user-auth.decorator'

describe('@UserAuth', () => {
  it('Applies given decorators', () => {
    const decorators = userAuthFactory()
    expect(decorators.length).toBe(1)
  })
})
