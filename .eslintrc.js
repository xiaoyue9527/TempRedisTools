/* eslint-env node */
// 此文件声明了 ESLint 在 Node.js 环境下运行

module.exports = {
  // extends 属性用于扩展已有的 ESLint 配置
  extends: [
    "eslint:recommended", // 启用 ESLint 内置的推荐规则集
    "plugin:@typescript-eslint/strict", // 启用 TypeScript-ESLint 插件的严格规则集
    "plugin:@typescript-eslint/stylistic", // 启用 TypeScript-ESLint 插件的风格规则集
  ],
  // parser 属性指定了用于解析代码的解析器
  parser: "@typescript-eslint/parser", // 使用 TypeScript-ESLint 的解析器，以支持 TypeScript 语法
  // plugins 属性指定了 ESLint 插件
  plugins: ["@typescript-eslint"], // 加载 TypeScript-ESLint 插件，以便使用其规则
  // root 属性表示这是项目的根配置文件，ESLint 不会向上查找其他配置文件
  root: true,
  rules: {
    "@typescript-eslint/no-inferrable-types": "off",
    "no-case-declarations": "off",
    "@typescript-eslint/no-useless-constructor": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
};
