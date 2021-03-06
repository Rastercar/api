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
    'node_modules',
    '.dto.ts',
    '.mock.ts',
    '.module.ts',
    '.entity.ts',
    '.model.ts',
    'main.ts',
    'constants',
    'migrations'
  ],
  testEnvironment: 'node',
  setupFiles: ['../test/utils/setup.ts']
}
