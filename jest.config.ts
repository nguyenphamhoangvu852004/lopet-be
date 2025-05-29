import type { Config } from 'jest'
import { createDefaultPreset } from 'ts-jest'

const tsJestPreset = createDefaultPreset()

const config: Config = {
  ...tsJestPreset,
  testEnvironment: 'node',
  transform: {
    ...tsJestPreset.transform
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^src/(.*)$': '<rootDir>/src/$1'
  }
}

export default config
