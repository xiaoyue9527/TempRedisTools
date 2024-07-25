#!/bin/bash

# 运行测试
echo "Running tests..."
npm run test

# 检查测试是否通过
if [ $? -ne 0 ]; then
  echo "Tests failed. Aborting release."
  exit 1
fi

# 获取提交信息
read -p "Enter commit message: " commit_message

# 提交到 Git 仓库
echo "Committing to Git..."
git add .
git commit -m "$commit_message"

# 推送到远程仓库
echo "Pushing to remote repository..."
git push

# 升级版本
echo "Upgrading version..."
npm version patch

# 发布到 npm
echo "Publishing to npm..."
npm publish

echo "Release process completed successfully."
