/**
 * Creates a object containing most of the EntityRepository methods from mikro-orm
 *
 * disclaimer: automatic mocking EntityRepository using jest.mock is a pain, use this instead
 */
export const createRepositoryMock = () => ({
  // for debugging purposes
  isMock: true,

  persist: jest.fn(),

  persistAndFlush: jest.fn(),

  findOne: jest.fn(async () => {
    console.log('create mock called')
  }),

  findOneOrFail: jest.fn(),

  find: jest.fn(),

  findAndCount: jest.fn(),

  findAll: jest.fn(),

  remove: jest.fn(),

  removeAndFlush: jest.fn(),

  flush: jest.fn(),

  nativeInsert: jest.fn(),

  nativeUpdate: jest.fn(),

  nativeDelete: jest.fn(),

  map: jest.fn(),

  getReference: jest.fn(),

  canPopulate: jest.fn(),

  populate: jest.fn(),

  create: jest.fn(),

  assign: jest.fn(),

  merge: jest.fn(),

  count: jest.fn()
})
