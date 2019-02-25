module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest'
  },
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.(js|jsx|ts|tsx)"],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
