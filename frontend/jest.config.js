const nextJest = require("next/jest");

const createJestConfig = nextJest({dir:"./"});

const customJestConfig = {
  clearMocks:true,
  testEnvironment:"jsdom",
  setupFilesAfterEnv:["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns:["<rootDir>/.next/","<rootDir>/node_modules/","<rootDir>/e2e/"],
  collectCoverageFrom:["app/**/*.{ts,tsx}","!app/**/*.d.ts","!app/layout.tsx"],
  coverageProvider:"v8",
  coverageReporters:["text","lcov"],
  coverageThreshold:{
    global:{branches:80,functions:75,lines:80,statements:80}
  }
};

module.exports = createJestConfig(customJestConfig);
