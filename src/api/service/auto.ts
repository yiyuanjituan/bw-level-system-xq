import { BaseService } from "./base";
import { createEpsService, createServiceRuntime } from "./eps";
import { eps } from "virtual:eps";

export interface CreateAutoRuntimeServiceOptions {
	service?: Record<string, any>;
	serviceModules?: Record<string, any>;
	namespaceRoot?: string;
	transformLocalServicePath?(service: any): string;
	onModuleError?(file: string, error: unknown): void;
}

function resetObject(target: Record<string, any>) {
	Object.keys(target).forEach((key) => {
		delete target[key];
	});
}

export function createAutoRuntimeService<TService = any>(
	options: CreateAutoRuntimeServiceOptions = {}
) {
	const service = options.service || {};

	function init(list: any[]) {
		resetObject(service);
		service.request = new BaseService().request;

		createServiceRuntime({
			service,
			eps: createEpsService(list || [], {
				namespaceRoot: options.namespaceRoot
			}),
			Service: BaseService,
			serviceModules: options.serviceModules,
			transformLocalServicePath: options.transformLocalServicePath,
			onModuleError: options.onModuleError
		});
	}

	init(eps.list || []);

	if (import.meta.hot) {
		import.meta.hot.on("eps-update", ({ list }) => {
			if (list) {
				init(list);
			}
		});
	}

	return service as TService;
}
