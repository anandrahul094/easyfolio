const nextJest = require("next/jest");

const createJestConfig = nextJest({dir:"./"});

const customJestConfig = {
  clearMocks:true,
  testEnvironment:"jsdom",
  setupFilesAfterEnv:["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns:["<rootDir>/.next/","<rootDir>/node_modules/"],
  collectCoverageFrom:["app/**/*.{ts,tsx}","!app/**/*.d.ts","!app/layout.tsx"],
  coverageProvider:"v8"
};

module.exports = createJestConfig(customJestConfig);
