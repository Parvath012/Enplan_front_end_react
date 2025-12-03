export default {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: [
    '<rootDir>/src/**/*.test.ts?(x)',
    '<rootDir>/tests/**/*.test.ts?(x)',
    '<rootDir>/tests/**/**/*.test.ts?(x)',
  ],
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // 👇 Add this line to mock commonApp federation alias
    '^commonApp/(.*)$': '<rootDir>/__mocks__/commonApp/$1.tsx',
  },
};
