import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import https from "node:https";
import type { IncomingHttpHeaders } from "node:http";
import type { Plugin, ViteDevServer } from "vite";
import { createEpsService, type EpsListItem } from "./eps";

interface EpsTypeMappingItem {
	type?: string;
	test?: string[];
	custom?(data: { propertyName: string; type: string }): string | undefined;
}

interface EpsParameterItem {
	description?: string;
	name: string;
	required?: boolean;
	schema?: {
		type?: string;
	};
}

interface EpsColumnItem {
	comment?: string;
	nullable?: boolean;
	propertyName: string;
	source?: string;
	type: string;
}

interface EpsApiDescribeItem {
	dts?: {
		parameters?: EpsParameterItem[];
	};
	method?: string;
	name?: string;
	path: string;
	summary?: string;
}

interface EpsDescribeItem extends EpsListItem {
	api?: EpsApiDescribeItem[];
	columns?: EpsColumnItem[];
	name?: string;
	pageColumns?: EpsColumnItem[];
	search?: any;
}

export interface CreateEpsPluginOptions {
	baseUrl: string;
	api?: string;
	dictApi?: string | false;
	headers?: IncomingHttpHeaders;
	jsonFileName?: string;
	dtsFileName?: string;
	namespaceRoot?: string;
	outDir?: string;
	timeout?: number;
	typeMapping?: EpsTypeMappingItem[];
}

interface SyncState {
	isUpdate: boolean;
	list: EpsDescribeItem[];
	service: Record<string, any>;
}

const virtualModuleId = "virtual:eps";
const resolvedVirtualModuleId = "\0virtual:eps";

function ensurePosix(value: string) {
	return value.replace(/\\/g, "/");
}

function stripSlash(value: string) {
	return value.replace(/^\/+|\/+$/g, "");
}

function upperFirst(value: string) {
	return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

function formatName(value: string) {
	return (value || "").replace(/[:,\s/.-]/g, "");
}

function toCamel(value: string) {
	return value.replace(/([^-])(?:-+([^-]))/g, function (_full, left, right) {
		return left + right.toUpperCase();
	});
}

function indent(value: string, size = 1) {
	const prefix = "\t".repeat(size);
	return value
		.split("\n")
		.map((line) => (line ? `${prefix}${line}` : line))
		.join("\n");
}

function createTypeMapping(options: CreateEpsPluginOptions) {
	return (
		options.typeMapping || [
			{
				test: ["string", "text", "varchar", "char", "uuid", "date", "datetime", "timestamp"],
				type: "string"
			},
			{
				test: ["int", "integer", "bigint", "smallint", "tinyint", "float", "double", "decimal", "number"],
				type: "number"
			},
			{
				test: ["boolean", "bool"],
				type: "boolean"
			},
			{
				test: ["array"],
				type: "any[]"
			},
			{
				test: ["json", "object"],
				type: "json"
			}
		]
	);
}

function getTsType(propertyName: string, valueType: string, mapping: EpsTypeMappingItem[]) {
	const normalized = String(valueType || "any").toLowerCase();

	for (const item of mapping) {
		if (item.custom) {
			const result = item.custom({
				propertyName,
				type: normalized
			});

			if (result) {
				return result;
			}
		}

		if (item.test?.includes(normalized) && item.type) {
			return item.type;
		}
	}

	if (!normalized) {
		return "any";
	}

	if (/^[a-zA-Z_$][\w$]*(\[\])?$/.test(normalized)) {
		return normalized;
	}

	return "any";
}

function createRequestUrl(baseUrl: string, api: string) {
	return `${baseUrl.replace(/\/+$/, "")}/${stripSlash(api)}`;
}

function requestJson(url: string, headers: IncomingHttpHeaders = {}, timeout = 5000): Promise<any> {
	return new Promise((resolve, reject) => {
		const target = new URL(url);
		const client = target.protocol === "https:" ? https : http;
		const req = client.request(
			target,
			{
				method: "GET",
				headers,
				timeout
			},
			(res) => {
				let raw = "";

				res.setEncoding("utf8");
				res.on("data", (chunk) => {
					raw += chunk;
				});
				res.on("end", () => {
					try {
						resolve(JSON.parse(raw || "{}"));
					} catch (error) {
						reject(error);
					}
				});
			}
		);

		req.on("error", reject);
		req.on("timeout", () => {
			req.destroy(new Error(`[eps-runtime] request timeout: ${url}`));
		});
		req.end();
	});
}

function writeIfChanged(filePath: string, content: string) {
	if (fs.existsSync(filePath)) {
		const oldContent = fs.readFileSync(filePath, "utf8");

		if (oldContent === content) {
			return false;
		}
	}

	fs.mkdirSync(path.dirname(filePath), {
		recursive: true
	});
	fs.writeFileSync(filePath, content, "utf8");

	return true;
}

function getMethodName(api: EpsApiDescribeItem) {
	const name = toCamel(formatName(api.name || api.path.split("/").filter(Boolean).pop() || ""));
	return name && !/[-:]/g.test(name) ? name : "";
}

function getResponseType(api: EpsApiDescribeItem, entityName: string) {
	switch (api.path) {
		case "/page":
			return `{
				pagination: { size: number; page: number; total: number; [key: string]: any };
				list: ${entityName}[];
				[key: string]: any;
			}`;

		case "/list":
			return `${entityName}[]`;

		case "/info":
			return entityName;

		default:
			return "any";
	}
}

function getParamType(api: EpsApiDescribeItem, mapping: EpsTypeMappingItem[]) {
	const params = (api.dts?.parameters || []).filter((item) => !item.name.includes(":"));

	if (!params.length) {
		return {
			optional: true,
			type: "any"
		};
	}

	const optional = !params.some((item) => item.required);
	const fields = params.map((item) => {
		const comment = item.description
			? `\n\t\t/** ${item.description} */\n\t\t`
			: "\n\t\t";
		const name = `${item.name}${item.required ? "" : "?"}`;
		const valueType = getTsType(item.name, item.schema?.type || "any", mapping);

		return `${comment}${name}: ${valueType};`;
	});

	return {
		optional,
		type: `{\n${fields.join("\n")}\n\t}`
	};
}

function createEntityDts(list: EpsDescribeItem[], mapping: EpsTypeMappingItem[]) {
	const added = new Set<string>();
	const blocks: string[] = [];

	list.forEach((item) => {
		const entityName = formatName(item.name || "");

		if (!entityName || added.has(entityName)) {
			return;
		}

		const mergedColumns: EpsColumnItem[] = [];
		const seen = new Set<string>();

		[item.columns || [], item.pageColumns || []].flat().forEach((column) => {
			const key = column.source || column.propertyName;

			if (!seen.has(key)) {
				seen.add(key);
				mergedColumns.push(column);
			}
		});

		const fields = mergedColumns
			.map((column) => {
				return `/**
	 * ${column.comment || column.propertyName}
	 */
	${column.propertyName}?: ${getTsType(column.propertyName, column.type, mapping)};`;
			})
			.join("\n\n");

		blocks.push(`interface ${entityName} {
${indent(fields)}

	/**
	 * 任意键值
	 */
	[key: string]: any;
}`);

		added.add(entityName);
	});

	return blocks.join("\n\n");
}

function createControllerDts(
	list: EpsDescribeItem[],
	service: Record<string, any>,
	mapping: EpsTypeMappingItem[]
) {
	const controllerBlocks: string[] = [];

	function deep(node: Record<string, any>, parentName = ""): string {
		const lines: string[] = [];

		for (const key in node) {
			const current = node[key];
			const interfaceName = `${parentName}${upperFirst(formatName(key))}`;

			if (current.namespace) {
				const item = list.find((entry) => stripSlash(entry.prefix) === stripSlash(current.namespace));

				if (!item) {
					continue;
				}

				const entityName = formatName(item.name || "any") || "any";
				const methods: string[] = [];
				const permissions: string[] = [];

				(item.api || []).forEach((api) => {
					const methodName = getMethodName(api);

					if (!methodName) {
						return;
					}

					const params = getParamType(api, mapping);
					const summary = api.summary || methodName;
					const responseType = getResponseType(api, entityName);

					methods.push(`/**
	 * ${summary}
	 */
	${methodName}(data${params.optional ? "?" : ""}: ${params.type}): Promise<${responseType}>;`);

					if (!permissions.includes(methodName)) {
						permissions.push(methodName);
					}
				});

				controllerBlocks.push(`interface ${interfaceName} {
${indent(methods.join("\n\n"))}

	/**
	 * 权限标识
	 */
	permission: { ${permissions.map((name) => `${name}: string;`).join(" ")} };

	/**
	 * 权限状态
	 */
	_permission: { ${permissions.map((name) => `${name}: boolean;`).join(" ")} };

	request: Service["request"];
}`);

				lines.push(`${formatName(key)}: ${interfaceName};`);
			} else {
				lines.push(`${formatName(key)}: {\n${indent(deep(current, interfaceName))}\n};`);
			}
		}

		return lines.join("\n");
	}

	const chain = deep(service);

	return {
		chain,
		controllers: controllerBlocks.join("\n\n")
	};
}

function createDtsContent(
	list: EpsDescribeItem[],
	service: Record<string, any>,
	dictKeys: string[],
	mapping: EpsTypeMappingItem[]
) {
	const entities = createEntityDts(list, mapping);
	const controllers = createControllerDts(list, service, mapping);
	const dictType = dictKeys.length ? dictKeys.map((key) => `"${key}"`).join(" | ") : "string";

	return `declare namespace Eps {
	type json = any;

${indent(entities)}

${indent(controllers.controllers)}

	type Service = {
		/**
		 * 基础请求
		 */
		request(options?: {
			url: string;
			method?: "POST" | "GET" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
			data?: any;
			params?: any;
			headers?: {
				authorization?: string;
				[key: string]: any;
			};
			timeout?: number;
			proxy?: boolean;
			[key: string]: any;
		}): Promise<any>;

${indent(controllers.chain, 2)}
	};

	type DictKey = ${dictType};
}
`;
}

function createJsonContent(list: EpsDescribeItem[]) {
	return `${JSON.stringify(
		list.map((item) => {
			return {
				prefix: item.prefix,
				name: item.name || "",
				api: (item.api || []).map((api) => {
					return {
						name: api.name,
						method: api.method,
						path: api.path,
						summary: api.summary
					};
				}),
				search: item.search
			};
		}),
		null,
		2
	)}
`;
}

async function loadEpsList(options: CreateEpsPluginOptions) {
	const url = createRequestUrl(options.baseUrl, options.api || "/app/base/comm/eps");
	const response = await requestJson(url, options.headers, options.timeout);
	const { code, data, message } = response || {};

	if (code !== 1000) {
		throw new Error(`[eps-runtime] ${message || `failed to fetch eps from ${url}`}`);
	}

	return Object.values(data || {}).flat() as EpsDescribeItem[];
}

async function loadDictKeys(options: CreateEpsPluginOptions) {
	if (options.dictApi === false) {
		return [];
	}

	const url = createRequestUrl(options.baseUrl, options.dictApi || "/app/dict/info/types");

	try {
		const response = await requestJson(url, options.headers, options.timeout);
		const { code, data } = response || {};

		if (code === 1000 && Array.isArray(data)) {
			return data.map((item) => item?.key).filter(Boolean);
		}
	} catch {
		return [];
	}

	return [];
}

function invalidateVirtualModule(server: ViteDevServer) {
	const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId);

	if (mod) {
		server.moduleGraph.invalidateModule(mod);
	}
}

export function createEpsPlugin(options: CreateEpsPluginOptions): Plugin {
	const state: SyncState = {
		isUpdate: false,
		list: [],
		service: {}
	};

	let root = process.cwd();
	let serverRef: ViteDevServer | undefined;

	async function sync() {
		const list = await loadEpsList(options);
		const mapping = createTypeMapping(options);
		const service = createEpsService(list, {
			namespaceRoot: options.namespaceRoot || "app"
		});
		const dictKeys = await loadDictKeys(options);
		const outDir = path.resolve(root, options.outDir || "copyDir/generated");
		const jsonPath = path.join(outDir, options.jsonFileName || "eps.json");
		const dtsPath = path.join(outDir, options.dtsFileName || "eps.d.ts");
		const jsonChanged = writeIfChanged(jsonPath, createJsonContent(list));
		const dtsChanged = writeIfChanged(dtsPath, createDtsContent(list, service, dictKeys, mapping));

		state.isUpdate = jsonChanged || dtsChanged;
		state.list = list;
		state.service = service;

		if (serverRef) {
			invalidateVirtualModule(serverRef);
		}

		return state;
	}

	return {
		name: "eps-runtime-plugin",
		enforce: "pre",
		configResolved(config) {
			root = config.root;
		},
		async buildStart() {
			await sync();
		},
		configureServer(server) {
			serverRef = server;

			server.middlewares.use(async (req, _res, next) => {
				if (req.url === "/@vite/client") {
					try {
						await sync();
					} catch (error) {
						server.config.logger.error(String(error));
					}
				}

				next();
			});
		},
		async handleHotUpdate(ctx) {
			const outDir = ensurePosix(path.resolve(root, options.outDir || "copyDir/generated"));
			const changedFile = ensurePosix(ctx.file);

			if (changedFile.startsWith(outDir)) {
				return;
			}

			try {
				const nextState = await sync();

				if (nextState.isUpdate) {
					invalidateVirtualModule(ctx.server);
					ctx.server.ws.send({
						type: "custom",
						event: "eps-update",
						data: {
							list: nextState.list,
							service: nextState.service
						}
					});
				}
			} catch (error) {
				ctx.server.config.logger.error(String(error));
			}
		},
		resolveId(id) {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
			}
		},
		async load(id) {
			if (id === resolvedVirtualModuleId) {
				if (!state.list.length) {
					await sync();
				}

				return `export const eps = ${JSON.stringify(state)};`;
			}
		}
	};
}
