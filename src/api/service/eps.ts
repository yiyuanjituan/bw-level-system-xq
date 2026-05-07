export interface EpsApiItem {
	method?: string;
	path: string;
	[key: string]: any;
}

export interface EpsListItem {
	prefix: string;
	api?: EpsApiItem[];
	search?: any;
	[key: string]: any;
}

export interface ServiceInstance {
	namespace?: string;
	request(options?: any): Promise<any>;
	[key: string]: any;
}

export interface ServiceConstructor<T extends ServiceInstance = ServiceInstance> {
	new (namespace?: string): T;
}

export interface CreateEpsServiceOptions {
	namespaceRoot?: string;
}

export interface CreateLocalServiceOptions {
	transformPath?(service: any): string;
	onError?(file: string, error: unknown): void;
}

export interface CreateServiceRuntimeOptions {
	service: Record<string, any>;
	eps: Record<string, any>;
	Service: ServiceConstructor;
	serviceModules?: Record<string, any>;
	transformLocalServicePath?(service: any): string;
	onModuleError?(file: string, error: unknown): void;
}

function stripSlash(value: string) {
	return value.replace(/^\/+|\/+$/g, "");
}

function toCamel(value: string) {
	return value.replace(/([^-])(?:-+([^-]))/g, function (_full, left, right) {
		return left + right.toUpperCase();
	});
}

function isObject(value: any) {
	return Object.prototype.toString.call(value) === "[object Object]";
}

function mergeObjects(target: Record<string, any>, source: Record<string, any>) {
	for (const key in source) {
		const targetValue = target[key];
		const sourceValue = source[key];

		if (isObject(targetValue) && isObject(sourceValue)) {
			mergeObjects(targetValue, sourceValue);
		} else {
			target[key] = sourceValue;
		}
	}

	return target;
}

function pathToObject(items: Array<{ path: string; value: any }>) {
	const result: Record<string, any> = {};

	items.forEach(({ path, value }) => {
		const segments = path.split("/").filter(Boolean);

		if (!segments.length) {
			return;
		}

		const fileName = segments[segments.length - 1];
		const parents = segments.slice(0, -1);

		let current = result;

		parents.forEach((segment) => {
			if (!current[segment]) {
				current[segment] = {};
			}

			current = current[segment];
		});

		current[fileName] = value;
	});

	return result;
}

function normalizeServicePath(prefix: string, namespaceRoot?: string) {
	const path = stripSlash(prefix);

	if (namespaceRoot && path.startsWith(`${namespaceRoot}/`)) {
		return path.slice(namespaceRoot.length + 1);
	}

	return path;
}

function getPermission(data: Record<string, any>, namespace: string) {
	return Object.keys(data)
		.filter((name) => !["namespace", "permission", "search"].includes(name))
		.reduce(
			(acc, name) => {
				acc[name] = `${namespace}/${name}`.replace(/\//g, ":");
				return acc;
			},
			{} as Record<string, string>
		);
}

export function createEpsService(data: EpsListItem[], options: CreateEpsServiceOptions = {}) {
	const service: Record<string, any> = {};

	data.forEach((item) => {
		const namespace = stripSlash(item.prefix);
		const path = normalizeServicePath(namespace, options.namespaceRoot);
		const keys = path.split("/").filter(Boolean).map(toCamel);

		if (!keys.length) {
			return;
		}

		let current = service;

		keys.forEach((key, index) => {
			if (index < keys.length - 1) {
				current[key] = current[key] || {};
				current = current[key];
				return;
			}

			const target = current[key] || {
				permission: {},
			};

			target.namespace = namespace;
			target.search = item.search;

			(item.api || []).forEach((api) => {
				const name = (api.path || "").replace("/", "");

				if (name && !/[-:]/g.test(name)) {
					target[name] = api;
				}
			});

			target.permission = getPermission(target, path);
			current[key] = target;
		});
	});

	return service;
}

export function injectEpsMethods(data: any, Service: ServiceConstructor) {
	if (!data || typeof data !== "object") {
		return data;
	}

	if (data.namespace) {
		const service = new Service(data.namespace) as any;
		service.request = service.request;

		for (const key in data) {
			const item = data[key];
			const { path, method = "GET" } = item || {};

			if (path) {
				service[key] = function (payload?: any) {
					const httpMethod = String(method).toUpperCase();

					return this.request({
						url: path,
						method: httpMethod,
						[httpMethod === "GET" ? "params" : "data"]: payload,
					});
				};
			}
		}

		for (const key in service) {
			data[key] = service[key];
		}

		return data;
	}

	for (const key in data) {
		injectEpsMethods(data[key], Service);
	}

	return data;
}

export function createLocalService(
	data: Record<string, any>,
	options: CreateLocalServiceOptions = {}
) {
	const { transformPath, onError } = options;
	const services: any[] = [];

	for (const file in data) {
		try {
			services.push(new data[file].default());
		} catch (error) {
			if (onError) {
				onError(file, error);
			} else {
				console.error(`[service] ${file} error: `, error);
			}
		}
	}

	return pathToObject(
		services.map((service) => {
			return {
				path: transformPath ? transformPath(service) : stripSlash(service.namespace || ""),
				value: service,
			};
		})
	);
}

export function createServiceRuntime(options: CreateServiceRuntimeOptions) {
	const {
		service,
		eps,
		Service,
		serviceModules,
		transformLocalServicePath,
		onModuleError,
	} = options;

	injectEpsMethods(eps, Service);
	mergeObjects(service, eps);

	if (serviceModules) {
		mergeObjects(
			service,
			createLocalService(serviceModules, {
				transformPath: transformLocalServicePath,
				onError: onModuleError,
			})
		);
	}

	return service;
}
