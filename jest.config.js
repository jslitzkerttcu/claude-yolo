export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['lib/**/*.js', 'bin/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  verbose: true
};
