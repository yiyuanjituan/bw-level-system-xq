import { BaseService } from "./base";
import { createEpsService, createServiceRuntime, type EpsListItem } from "./eps";

export interface CreateRuntimeServiceOptions {
	epsList: EpsListItem[];
	serviceModules?: Record<string, any>;
	namespaceRoot?: string;
	transformLocalServicePath?(service: any): string;
	onModuleError?(file: string, error: unknown): void;
}

export function createRuntimeService<TService = any>(options: CreateRuntimeServiceOptions) {
	const service: Record<string, any> = {
		request: new BaseService().request,
	};

	return createServiceRuntime({
		service,
		eps: createEpsService(options.epsList, {
			namespaceRoot: options.namespaceRoot,
		}),
		Service: BaseService,
		serviceModules: options.serviceModules,
		transformLocalServicePath: options.transformLocalServicePath,
		onModuleError: options.onModuleError,
	}) as TService;
}

export * from "./base";
export * from "./eps";
