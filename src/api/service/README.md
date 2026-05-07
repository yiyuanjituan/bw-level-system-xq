# EPS Runtime

这套目录现在包含两部分能力：

1. 运行时 `service.xx.yy.zz()` 封装
2. Vite 启动时自动从 API 拉取最新 EPS，并生成 `eps.json` 和 `eps.d.ts`

也就是说，后端新增接口后，前端不需要手动补 `eps.json` 和 `eps.d.ts`，只要 Vite 初始化时能访问到 API，就会自动拉最新数据并重新初始化。

## 文件说明

- `base.ts`：通用 `BaseService`
- `eps.ts`：把 EPS 描述转换成运行时 `service`
- `index.ts`：手动传入 `epsList` 的运行时入口
- `auto.ts`：基于 `virtual:eps` 自动初始化运行时 `service`
- `vite.ts`：Vite 插件，负责拉取 API、生成 `eps.json` / `eps.d.ts`
- `client.d.ts`：`virtual:eps` 的类型声明

## 推荐接入方式

### 1. 在 `vite.config.ts` 中初始化插件

```ts
import { defineConfig } from "vite";
import { createEpsPlugin } from "./copyDir/vite";

export default defineConfig({
	plugins: [
		createEpsPlugin({
			baseUrl: "http://127.0.0.1:8001",
			api: "/app/base/comm/eps",
			dictApi: "/app/dict/info/types",
			namespaceRoot: "app",
			outDir: "copyDir/generated"
		})
	]
});
```

这个插件会做几件事：

- Vite 启动时自动请求 EPS 接口
- 生成 `copyDir/generated/eps.json`
- 生成 `copyDir/generated/eps.d.ts`
- 提供 `virtual:eps`
- 浏览器刷新时重新拉一次最新 EPS
- 开发期文件更新时，如果 EPS 变化，会触发一次 `eps-update`

## 2. 初始化请求适配器

```ts
import axios from "axios";
import { BaseService } from "./copyDir/base";

BaseService.setup({
	baseUrl: "http://127.0.0.1:8001",
	request: async (options) => {
		const response = await axios({
			url: options.url,
			method: options.method,
			params: options.params,
			data: options.data,
			headers: options.headers
		});

		return response.data?.data ?? response.data;
	}
});
```

## 3. 在前端自动初始化 `service`

```ts
import { createAutoRuntimeService } from "./copyDir/auto";

const modules = import.meta.glob("./service/**/*.ts", {
	eager: true
});

export const service = createAutoRuntimeService<Eps.Service>({
	namespaceRoot: "app",
	serviceModules: modules
});
```

这样以后你用的就是：

```ts
service.user.login.refreshToken({
	refreshToken: "xxx"
});
```

## 生成结果

插件默认会生成到：

```text
copyDir/generated/eps.json
copyDir/generated/eps.d.ts
```

你也可以通过 `outDir` 改成别的目录。

## 类型提示

`eps.d.ts` 会在 Vite 初始化时自动生成。

只要目标项目的 `tsconfig.json` 能包含这个文件，`service.xx.yy.zz` 就会有类型提示。

如果你的 `tsconfig.json` 没包含生成目录，可以补上类似配置：

```json
{
	"include": ["**/*.ts", "**/*.vue", "copyDir/generated/*.d.ts"]
}
```

## 两种运行方式

### 方式一：全自动，推荐

- `vite.ts` 自动拉取 EPS
- `auto.ts` 自动初始化 service
- 后续浏览器刷新时会重新取最新 EPS

### 方式二：手动传入 `epsList`

如果你不想依赖 `virtual:eps`，也可以自己导入 `eps.json`：

```ts
import epsList from "./copyDir/generated/eps.json";
import { createRuntimeService } from "./copyDir";

export const service = createRuntimeService<Eps.Service>({
	epsList,
	namespaceRoot: "app"
});
```

## 说明

这套目录现在已经把“新增后端接口后，前端自动生成 `eps.json` 和 `eps.d.ts`”这条链补上了。

当前自动刷新逻辑是：

- Vite 启动时拉取一次
- 浏览器刷新时拉取一次
- 前端文件热更新时会尝试同步一次

如果你还想加“定时轮询后端 EPS，后端一改接口前端立刻更新”，可以再补一层轮询配置。
