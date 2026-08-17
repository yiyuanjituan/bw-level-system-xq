/// <reference types="vite/client" />

interface Window {
	__APP_RUNTIME_CONFIG__?: {
		baseURL?: string;
	};
}

declare module "*.vue" {
	import type { DefineComponent } from "vue";

	const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
	export default component;
}
