import { http } from "@/utils/http";
import { createAutoRuntimeService } from "./auto";
import { BaseService, type RequestOptions } from "./base";

export interface RuntimeService extends Record<string, any> {
	request(options?: RequestOptions): Promise<any>;
}

export interface InitServiceOptions {
	namespaceRoot?: string;
	serviceModules?: Record<string, any>;
	transformLocalServicePath?(service: any): string;
	onModuleError?(file: string, error: unknown): void;
}

function normalizeRequestUrl(url?: string) {
	if (!url || /^https?:\/\//i.test(url) || url.startsWith("/")) {
		return url;
	}

	return `/${url}`;
}

BaseService.setup({
	request: ({ proxy: _proxy, method, url, ...options }) =>
		http.request({
			...options,
			url: normalizeRequestUrl(url),
			method: method ? String(method).toLowerCase() : method,
		}),
});

export const service = createAutoRuntimeService<RuntimeService & Eps.Service>({
	namespaceRoot: "app",
});

export function initService(_options: InitServiceOptions = {}) {
	return Promise.resolve(service);
}

export function ensureService(options: InitServiceOptions = {}) {
	return initService(options);
}

export function refreshService(options: InitServiceOptions = {}) {
	return initService(options);
}
