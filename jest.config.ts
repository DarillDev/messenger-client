import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.module.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/main.ts',
    '!src/main.prod.ts',
    '!src/**/app.config.ts',
    '!src/**/app.routes.ts',
    '!src/**/*.model.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.type.ts',
    '!src/**/*.enum.ts',
    '!src/mock-api/**',
  ],
  coverageReporters: ['html', 'text-summary', 'json-summary'],
  moduleNameMapper: {
    '^@angular/core/rxjs-interop$':
      '<rootDir>/node_modules/@angular/core/fesm2022/rxjs-interop.mjs',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@store/(.*)$': '<rootDir>/src/app/store/$1',
    '^@pages/(.*)$': '<rootDir>/src/app/pages/$1',
    '^@mock-api/(.*)$': '<rootDir>/src/mock-api/$1',
  },
};

export default config;
