module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  coverageDirectory: '../coverage',
  collectCoverageFrom: ['**/*.ts'],
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
