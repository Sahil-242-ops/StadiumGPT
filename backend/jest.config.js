/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  testEnvironmentOptions: {
    env: { NODE_ENV: 'test' },
  },
  globalSetup: undefined,
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        module: 'CommonJS',
      },
    }],
  },
  moduleNameMapper: {
    // Strip .js extensions from imports (TypeScript ESM → CJS compat)
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/__tests__/**',
    // Config, prompts and utils are not directly unit-testable (env config or standalone unused)
    '!src/config/**',
    '!src/prompts/**',
    '!src/utils/**',
  ],
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 60,
      functions: 60,   // geminiClient private methods not reachable without live API key
      lines: 75,
    },
  },
  clearMocks: true,
};
