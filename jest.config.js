module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  coverageDirectory: '../coverage',
  coveragePathIgnorePatterns: ['node_modules', '.dto.ts', '.mock.ts', '.module.ts', '.entity.ts', '.model.ts', '<rootDir>/src/app/main.ts'],
  testEnvironment: 'node',
  setupFiles: ['../test/utils/setup.ts']
}
