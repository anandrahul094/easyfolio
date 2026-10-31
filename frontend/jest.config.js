const nextJest = require("next/jest");

const createJestConfig = nextJest({dir:"./"});

const customJestConfig = {
  clearMocks:true,
  testEnvironment:"jsdom",
  setupFilesAfterEnv:["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns:["<rootDir>/.next/","<rootDir>/node_modules/"],
  collectCoverageFrom:["app/**/*.{ts,tsx}","!app/**/*.d.ts","!app/layout.tsx"],
  coverageProvider:"v8",
  coverageReporters:["text","lcov"],
  coverageThreshold:{
    global:{branches:75,functions:80,lines:90,statements:90}
  }
};

module.exports = createJestConfig(customJestConfig);
