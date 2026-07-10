import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
  setupFiles: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: ['modules/**/*.ts', 'shared/**/*.ts', '!**/*.test.ts'],
};

export default config;
