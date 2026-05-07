export interface RequestOptions {
	url: string;
	method?: string;
	data?: any;
	params?: any;
	proxy?: boolean;
	[key: string]: any;
}

export type RequestHandler = (options: RequestOptions) => Promise<any>;

export interface BaseServiceConfig {
	baseUrl?: string;
	request?: RequestHandler;
}

function trimSlash(value: string) {
	return value.replace(/^\/+|\/+$/g, "");
}

function joinUrl(...parts: string[]) {
	return parts.filter(Boolean).map(trimSlash).join("/");
}

export class BaseService {
	static config: BaseServiceConfig = {};

	static setup(config: BaseServiceConfig) {
		BaseService.config = {
			...BaseService.config,
			...config,
		};
	}

	namespace?: string;

	constructor(namespace?: string) {
		if (namespace) {
			this.namespace = namespace;
		}
	}

	async request(options: RequestOptions) {
		const executor = BaseService.config.request;

		if (!executor) {
			throw new Error("[eps-runtime] BaseService.setup({ request }) is required");
		}

		let url = options.url;

		if (url && !/^https?:\/\//i.test(url)) {
			if (this.namespace) {
				url = `${trimSlash(this.namespace)}${url}`;
			}

			if (options.proxy !== false && BaseService.config.baseUrl) {
				url = joinUrl(BaseService.config.baseUrl, url);
			}
		}

		return executor({
			...options,
			url,
		});
	}

	async list(data: any) {
		return this.request({
			url: "/list",
			method: "POST",
			data,
		});
	}

	async page(data: any) {
		return this.request({
			url: "/page",
			method: "POST",
			data,
		});
	}

	async info(params: any) {
		return this.request({
			url: "/info",
			method: "GET",
			params,
		});
	}

	async update(data: any) {
		return this.request({
			url: "/update",
			method: "POST",
			data,
		});
	}

	async delete(data: any) {
		return this.request({
			url: "/delete",
			method: "POST",
			data,
		});
	}

	async add(data: any) {
		return this.request({
			url: "/add",
			method: "POST",
			data,
		});
	}
}
