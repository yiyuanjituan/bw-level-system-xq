# 项目 AI 协作规则

## 构建规则

- 默认禁止运行任何项目构建命令，包括但不限于 `npm run build`、`pnpm run build`、`yarn build` 和 `vite build`。
- 只有当用户在当前任务中明确要求执行构建时，才允许运行构建命令。

## 界面预览规则

- 默认禁止启动开发服务器或使用浏览器、截图等方式预览界面。
- 只有当用户在当前任务中明确要求预览界面时，才允许进行界面预览。

## ESLint 规则

- 默认禁止运行 ESLint，包括但不限于 `eslint`、`npm run lint`、`pnpm run lint` 和 `yarn lint`。
- 只有当用户在当前任务中明确要求使用 ESLint 时，才允许运行相关命令。
