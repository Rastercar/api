module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../src',
  verbose: true,
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  coverageDirectory: '../coverage',
  collectCoverageFrom: ['**/*.ts'],
  testPathIgnorePatterns: ['/node_modules/', 'e2e'],
  coveragePathIgnorePatterns: [
    '.dto.ts',
    '.mock.ts',
    '.model.ts',
    '.module.ts',
    '.entity.ts',
    '.seeder.ts',
    '.e2e-spec.ts',
    'main.ts',
    'constants',
    'migrations',
    'node_modules'
  ],
  testEnvironment: 'node',
  setupFiles: ['../test/utils/setup.ts']
}
