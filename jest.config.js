/* eslint-disable no-undef */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    transform: {
      '^.+\\.ts$': 'ts-jest'
    },
    testMatch: ['**/test/**/*.test.ts'], // 匹配测试文件的模式
  };
  